import * as vscode from 'vscode';
import * as fastglob from 'fast-glob';
import uripath from 'file-uri-to-path';
import path, { sep } from 'path';
import fs, { readFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {

	const outputChannel = vscode.window.createOutputChannel("Arma 3 CfgFunctions.hpp Generator");

	let disposableCfgFunctionsGenerator = vscode.commands.registerCommand('cfgfunctions.generateCfgFunctions', async () => {
 
		let errors = false;
		
		outputChannel.clear();
		outputChannel.show();

		outputChannel.appendLine("###  ARMA 3 CFGFUNCTIONS GENERATOR  ###");
		outputChannel.appendLine("---");

		const developerTag = vscode.workspace.getConfiguration().get('cfgfunctionsTag');

		if(developerTag === 'YOUR_TAG_HERE') {
			vscode.window.showErrorMessage('Your developer/project tag is not yet defined in extension settings! Please define it via VS Code -> Settings -> Extensions and try again.');
			errors = true;
			// return;
		}

		outputChannel.appendLine("Starting to generate CfgFunctions.hpp.");
		outputChannel.appendLine("---");

		outputChannel.appendLine('Your developer/project tag is: ' + developerTag);
		outputChannel.appendLine("---");

		// Define start of CfgFunctions.hpp
		let content =
			"#ifdef DEBUG_ENABLED_FULL\n" +
			"allowFunctionsRecompile = 1;\n" +
			"allowFunctionsLog = 1;\n" +
			"#endif\n" +
			"\n" +
			"class CfgFunctions\n" +
			"{\n" +
			"\n" +
			"\tclass " + developerTag + "\n" +
			"\t{\n" +
			"\n";

		const currentFileString = vscode.window.activeTextEditor?.document.uri.fsPath.toString() ?? "";
		context.workspaceState.update('cfgFunctionsPathInProject', currentFileString);

		const currentDirString = path.dirname(currentFileString);
		const currentDirUri = vscode.Uri.file(currentDirString);

		const filesOutsideOfFunctionsFolder = fastglob.sync(("*.sqf"), {cwd: currentDirString, globstar: true});

		if (filesOutsideOfFunctionsFolder.length > 0) {
			filesOutsideOfFunctionsFolder.forEach(function(fileOutside) {
				outputChannel.appendLine("File \"" + fileOutside + "\" didn't get included to CfgFunctions. It needs to be located in a subfolder of " + path.sep + "functions folder.");
			});
		}
		
		// Get all categories by looking at the folders
		const categories = await vscode.workspace.fs.readDirectory(currentDirUri).then((results) =>
		// Include folders only (and not files)
		results.filter((result) => result[1] === 2).map((filteredResult) => filteredResult[0])
		);

		const categoriesUpperCase = categories.map(category => category.toUpperCase());

		let focusWarningShown = false;

		categories.forEach (function (category) {
			content = content + "\t\tclass " + category + "\n\t\t{\n\n";

			let sqfFiles = [""];

			try {
				sqfFiles = fastglob.sync((category + "/**/*.sqf"), {cwd: currentDirString, globstar: true});
			} catch (error) {
				vscode.window.showErrorMessage("Something went wrong! Make sure that you've clicked the editor area of your CfgFunctions.hpp before clicking the generate button.");
				outputChannel.appendLine("*** GENERIC ERROR ***");
				outputChannel.appendLine("Something went wrong! Make sure that you've clicked the editor area of your CfgFunctions.hpp before clicking the generate button.");
				outputChannel.appendLine("***");
				errors = true;
				return;
			}

			if (sqfFiles.length > 0) {
				sqfFiles.forEach(function(sqfFile) {
					const formattedClass = formatFunctionClass(vscode.Uri.file(sqfFile), outputChannel);

					if (formattedClass !== "") {
						content = content + "\t\t\t" + formattedClass + "\n";
					}
				});
			} else {
				if (!focusWarningShown) {
					vscode.window.showErrorMessage("Something went wrong! Make sure that you've clicked the editor area of your CfgFunctions.hpp before clicking the generate button.");
					outputChannel.appendLine("GENERIC ERROR");
					outputChannel.appendLine("Something went wrong! Make sure that you've clicked the editor area of your CfgFunctions.hpp before clicking the generate button.");
					outputChannel.appendLine("---");
					focusWarningShown = true;
					errors = true;
					return;
				}
			}

			content = content + "\n\t\t};\n\n";

		});

		content = content + "\t};\n\n};\n\n";

		const outputCfgFunctions = "\n" + content;

		const currentEditor = vscode.window.activeTextEditor;

		if (currentEditor) {
			// let cfgFunctionsHpp = vscode.window.tabGroups.activeTabGroup.activeTab?.input.kind.uri;
			let cfgFunctionsHpp = currentEditor.document.uri.fsPath;
			fs.writeFileSync(cfgFunctionsHpp, outputCfgFunctions, 'utf8');
		}

		if (!errors) {
			outputChannel.appendLine("");
			outputChannel.appendLine("Generation of CfgFunctions.hpp finished.");
		}
		
	});

	context.subscriptions.push(disposableCfgFunctionsGenerator);

	const cfgFunctionsPathInProject = context.workspaceState.get<string>('cfgFunctionsPathInProject') ?? '';

	const cfgFunctionsFncNames = loadCfgFunctionsCompletion(context, cfgFunctionsPathInProject);

	if (cfgFunctionsFncNames === undefined || cfgFunctionsPathInProject === '') {
		return;
	}

	let disposableCfgRemoteExecGenerator = vscode.commands.registerCommand('cfgfunctions.generateCfgRemoteExec', async () => { 
		
		generateCfgRemoteExec(context);

	});

	context.subscriptions.push(disposableCfgRemoteExecGenerator);

}

export function deactivate(): void {}

function formatFunctionClass(sqfFileURI: vscode.Uri, outputChannel: vscode.OutputChannel) {
	let functionName = "";
	let functionPath = "";
	let functionDirPath = "";
	let subcategory = "";
	let returnValue = "";
	let sqfFileString = uripath(sqfFileURI.toString());

	sqfFileString = "functions" + sqfFileString;

	if (sqfFileString.endsWith('.sqf')) {

		functionDirPath = path.dirname(sqfFileString);
		while (functionDirPath.charAt(0) === path.sep) {
			functionDirPath = functionDirPath.substring(1);
		}
		
		let functionDirPathSplit = functionDirPath.split(path.sep);
		
		const depth = functionDirPathSplit.length;

		let sqfFileStringSplit = sqfFileString.split(path.sep);
		let sqfFilename = sqfFileStringSplit?.at(-1) ?? "";

		if (sqfFilename === undefined) {
			vscode.window.showErrorMessage("Generic error!");
			outputChannel.appendLine("GENERIC ERROR");
		}

		functionName = sqfFilename.replace(".sqf", "");

		if (sqfFilename.startsWith('fn_')) {

			let sqfFileStringTemp = sqfFileString;

			while (sqfFileStringTemp.charAt(0) === path.sep) {
				sqfFileStringTemp = sqfFileStringTemp.substring(1);
			}

			functionName = functionName.replace("fn_", "");

			functionPath = functionDirPath + path.sep + sqfFilename;

			if (depth > 2) {
				let functionDirPathSplitReversed = functionDirPathSplit.reverse();
				subcategory = functionDirPathSplitReversed[depth - (depth - (depth - 3))];

				returnValue = nestedFolderFunctionName(subcategory, functionName, functionPath);
			}

			else if (depth === 2) {
				returnValue = coreFunctionName(functionName, functionPath);

			}
			
			else {
				outputChannel.appendLine("Function \"" + functionName + "\" didn't get included to CfgFunctions. It needs to be located in a subfolder of " + path.sep + "functions folder.");
			}

		} else {
			outputChannel.appendLine("File \"" + functionDirPath + path.sep + sqfFilename + "\" didn't get included to CfgFunctions: file name didn't start with 'fn_'.");
		}

	} else {
		vscode.window.showErrorMessage("Generic error! Something went wrong when generating CfgFunctions. Double check the contents of it.");
		outputChannel.appendLine("GENERIC ERROR! Something went wrong when generating CfgFunctions. Double check the contents of it.");
		return;
	}

	return returnValue;
}

function nestedFolderFunctionName(subcategory: string, functionName: string, functionPath: string) {
	return "class " + subcategory + "_" + functionName + " { file = \"" + functionPath + "\"; };";
}

function coreFunctionName(functionName: string, functionDirPath: string) {
	return "class " + functionName + " { file = \"" + functionDirPath + "\"; };";
}

function loadCfgFunctionsCompletion(context: vscode.ExtensionContext, cfgFunctionsPath: string) {

	if (cfgFunctionsPath === undefined) {
		return;
	}

	const cfgFunctionsFile = readFileSync(cfgFunctionsPath, 'utf-8');
	
	const cfgFunctionsLines = cfgFunctionsFile.split(/\r?\n/);

	let cfgFunctionsLinesFiltered = [];

	const cfgFunctionsLinesIterator = cfgFunctionsLines.values();

	for (const line of cfgFunctionsLinesIterator) {
		if (line.toString().includes(".sqf")) {
			cfgFunctionsLinesFiltered.push(line);
		}
	}

	let cfgFunctionsFncsFormatted:string[] = [];

	const cfgFunctionsFncsIterator = cfgFunctionsLinesFiltered.values();

	const developerTag:string = vscode.workspace.getConfiguration().get('cfgfunctionsTag') ?? 'YOUR_TAG_HERE';

	for (const line of cfgFunctionsFncsIterator) {
		const lineStr = line.toString();
		const functionName = developerTag + "_fnc_" + (lineStr.substring(lineStr.indexOf("class ") + 6, (lineStr.indexOf(" { file = "))));
		cfgFunctionsFncsFormatted.push(functionName);
	}

	const provider = vscode.languages.registerCompletionItemProvider('sqf', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			const cmpItems = new Array<vscode.CompletionItem>;

			for (const fnc of cfgFunctionsFncsFormatted) {
				
				// kind/type: 13 = KEYWORD - see index.d.ts:4413
				const cmpItem = new vscode.CompletionItem(fnc, vscode.CompletionItemKind.Function);
				cmpItems.push(cmpItem);
			}

			return cmpItems;
		}

	}

	);
		
	context.subscriptions.push(provider);

	return cfgFunctionsFncsFormatted;
}

function generateCfgRemoteExec(context: vscode.ExtensionContext) {
	let content =
			"\n" +
			"class CfgRemoteExec\n" +
			"{\n" +
			"\n" +
			"\tclass " + "Functions" + "\n" +
			"\t{\n" +
			"\n" +
			"\t\t" + "// Only whitelisted functions are allowed. Other values: 0 = remote execution blocked, 2 = remote execution fully allowed (no whitelist)" + "\n" +
			"\t\t" + "mode = 1;" + 
			"\n" +
			"\t\t" + "// JIP flag can not be set by default (unless overriden by function or command declaration itself). Other values: 1 = JIP flag can be set" + "\n" +
			"\t\t" + "jip = 0;" +
			"\n\n" +
			"\t\t" + "// Note that 'allowedTargets' properties in the list below can target all machines by default! Changing them on a case-by-case basis is highly recommended." + "\n" +
			"\t\t" + "// Other (and recommended) values: 1 = only clients as allowed target, 2 = only server as allowed target" +
			"\n\n";

	const cfgFunctionsPath = vscode.window.activeTextEditor?.document.uri.fsPath;

	const outputChannel = vscode.window.createOutputChannel("Arma 3 CfgRemoteExec generator");

	outputChannel.appendLine("" + cfgFunctionsPath);

	if (cfgFunctionsPath === undefined) {
		vscode.window.showErrorMessage("Error! Make sure that you've clicked the editor area of your CfgFunctions.hpp before running the CfgRemoteExec generation task.");
		outputChannel.appendLine("Error! Make sure that you've clicked the editor area of your CfgFunctions.hpp before running the CfgRemoteExec generation task.");
		return;
	}
	
	const cfgFunctionsFile = readFileSync(cfgFunctionsPath, 'utf-8');
	
	const cfgFunctionsLines = cfgFunctionsFile.split(/\r?\n/);
	
	let cfgFunctionsLinesFiltered = [];
	
	const cfgFunctionsLinesIterator = cfgFunctionsLines.values();
	
	for (const line of cfgFunctionsLinesIterator) {
		if (line.toString().includes(".sqf")) {
			cfgFunctionsLinesFiltered.push(line);
		}
	}
	
	let cfgFunctionsFncsFormatted = [];
	
	const cfgFunctionsFncsIterator = cfgFunctionsLinesFiltered.values();
	
	const developerTag = vscode.workspace.getConfiguration().get('cfgfunctionsTag');
	
	for (const line of cfgFunctionsFncsIterator) {
		const lineStr = line.toString();
		const functionName = developerTag + "_fnc_" + (lineStr.substring(lineStr.indexOf("class ") + 6, (lineStr.indexOf(" { file = "))));
		cfgFunctionsFncsFormatted.push(functionName);
	}

	const cfgFunctionsFncsFormattedIterator = cfgFunctionsFncsFormatted.values();

	for (const fnc of cfgFunctionsFncsFormattedIterator) {
		let fncRemoteExecClassString =
			"\t\t" + "class " + fnc + "\n" +
			"\t\t" + "{" + "\n" +
			"\t\t\t" + "allowedTargets = 0;" + "\n" +
			"\t\t\t" + "jip = 0;" + "\n" +
			"\t\t};" +
			"\n\n";

		content += fncRemoteExecClassString;
	}

	content += "\t\t};"

	content += "\n\n" + 
		"class Commands" + "\n" + "\t{" + "\n" +
		"\t\t" + "// Only whitelisted commands are allowed. Other values: 0 = remote execution blocked, 2 = remote execution fully allowed (no whitelist)" + "\n" +
		"\t\t" + "mode = 1;" + "\n\n" +
		"\t\t" + "// Note that blocking raw SQF command input is recommended. You should whitelist only (precompiled) functions because of security reasons." + "\n" +
		"\t\t" + "// See more info (and a super useful trick to increase security of your project) at the comments section of https://community.bistudio.com/wiki/remoteExec" + "\n" +
		"\t};" + "\n\n" +
		"};";

	const workspaceEdit = new vscode.WorkspaceEdit();

	const cfgFunctionsURI = vscode.window.activeTextEditor?.document.uri.fsPath.toString();

	const formattedCfgFunctionsFsPathString = require("path").join(cfgFunctionsURI, "../");

	let cfgRemoteExecURI = vscode.Uri.file(formattedCfgFunctionsFsPathString + "CfgRemoteExec.hpp");

	if (cfgRemoteExecURI === undefined) {
		return;
	}

	// const cfgFunctionsURIsSplit = format.split(sep);
	// const cfgFunctionsFolderURI = cfgFunctionsURIsSplit?.slice(0, cfgFunctionsURIsSplit.length-1).join(sep);

	workspaceEdit.createFile(cfgRemoteExecURI, {overwrite: false});

	fs.writeFileSync(cfgRemoteExecURI.fsPath, content, {flag: "ax"});

	vscode.workspace.applyEdit(workspaceEdit);

}
