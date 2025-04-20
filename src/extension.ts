import * as vscode from 'vscode';
import * as fastglob from 'fast-glob';
import uripath from 'file-uri-to-path';
import path, { sep } from 'path';
import fs, { readFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {

	const outputChannel = vscode.window.createOutputChannel("Arma 3 CfgFunctions.hpp Generator");

	let muteChannel = true;

	outputChannel.clear();
	outputChannel.show();

	if (!muteChannel) {
		outputChannel.appendLine("###  ARMA 3 CFGFUNCTIONS GENERATOR  ###");
		outputChannel.appendLine("---");
	}

	let options = getOptions(outputChannel, muteChannel);

	let developerTag = String(options[0]);

	const cfgFunctionsPathInProject = context.workspaceState.get<string>('cfgFunctionsPathInProject') ?? '';

	var disposableCfgFunctionsCompletion = loadCfgFunctionsCompletion(context, cfgFunctionsPathInProject, developerTag);


	let disposableCfgFunctionsGenerator = vscode.commands.registerCommand('cfgfunctions.generateCfgFunctions', async () => {

		let errors = false;

		outputChannel.clear();
		outputChannel.show();

		outputChannel.appendLine("###  ARMA 3 CFGFUNCTIONS GENERATOR  ###");
		outputChannel.appendLine("---");

		let muteOutputChannel = false;

		const options = getOptions(outputChannel, muteOutputChannel);

		let developerTag = String(options[0]);

		let pboPrefix = String(options[1]);

		let debugEnabled = options[2];

		outputChannel.appendLine("Starting to generate CfgFunctions.hpp.");
		outputChannel.appendLine("---");

		outputChannel.appendLine('Your developer/project tag is: ' + developerTag);
		outputChannel.appendLine("---");

		if(developerTag === 'YOUR_TAG_HERE') {
			vscode.window.showErrorMessage('Your developer/project tag is not defined yet in extension settings! Please define it via VS Code -> Settings -> Extensions or local config file and try again.');
		}
 
		// Define start of CfgFunctions.hpp

		let content = "";

		if (debugEnabled) {
			content +=
				"#ifdef DEBUG_ENABLED_FULL\n" +
				"allowFunctionsRecompile = 1;\n" +
				"allowFunctionsLog = 1;\n" +
				"#endif\n" +
				"\n";
		}

		content += "class CfgFunctions\n" +
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
					const formattedClass = formatFunctionClass(vscode.Uri.file(sqfFile), outputChannel, pboPrefix);

					if (formattedClass !== "") {
						content = content + "\t\t\t" + formattedClass + "\n";
					}
				});
			} else {
				if (sqfFiles.length == 0) {
					vscode.window.showWarningMessage("Empty category detected when generating CfgFunctions.");
					outputChannel.appendLine("Empty category \"" + category + "\" detected.");
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

	const cfgFunctionsPathInProject = context.workspaceState.get<string>('cfgFunctionsPathInProject') ?? '';

	disposableCfgFunctionsCompletion?.dispose();

	disposableCfgFunctionsCompletion = loadCfgFunctionsCompletion(context, cfgFunctionsPathInProject, developerTag);

	});

	context.subscriptions.push(disposableCfgFunctionsGenerator);


	let disposableCfgRemoteExecGenerator = vscode.commands.registerCommand('cfgfunctions.generateCfgRemoteExec', async () => { 
		
		generateCfgRemoteExec(context);

	});

	context.subscriptions.push(disposableCfgRemoteExecGenerator);

}

export function deactivate(): void {}

function getOptions(outputChannel: vscode.OutputChannel, muteChannel: boolean) {

	let developerTagDefined = false;
	let developerTag = 'YOUR_TAG_HERE';

	let pboPrefixDefined = false;
	let pboPrefix:string = '';

	let debugEnabledDefined = false;
	let debugEnabled = false;

	let allowRemoteExecDefined = false;
	let allowRemoteExec = false;

	try {
		const currentPath = vscode.window.activeTextEditor?.document.uri.fsPath ?? '';
		const parentPath = path.dirname(currentPath);
		const localSettingsFile = fs.readFileSync(parentPath + path.sep + 'cfgFunctions.txt', 'utf-8').toString();
		const localSettings = localSettingsFile.split(/\r?\n/);

		const localSettingsLines = localSettings.values();

		for (const line of localSettingsLines) {
			let localSetting = line.split(/[=]/);
			let parameter = localSetting[0];
			if (parameter == "developerTag") {
				let value = localSetting[1]
				developerTag = value;
				developerTagDefined = true;
			} else if (parameter == "pboPrefix") {
				let value = localSetting[1];
				pboPrefix = value;
				pboPrefixDefined = true;
			} else if (parameter == "debugEnabled") {
				let value = localSetting[1];
				if (value == "true") {
					debugEnabled = true;
					debugEnabledDefined = true;
				} else if (value == "false") {
					debugEnabled = false;
					debugEnabledDefined = true;
				}
			} else if (parameter == "allowRemoteExec") {
				let value = localSetting[1];
				if (value == "true") {
					allowRemoteExec = true;
					allowRemoteExecDefined = true;
				} else if (value == "false") {
					allowRemoteExec = false;
					allowRemoteExecDefined = true;
				}
			}
		}
	} catch (error) {
		if (!muteChannel) {
			outputChannel.appendLine("Project specific config override file was not found. (You can safely ignore this message unless you are trying to use a local config file overriding global settings.)");
		}
	}

	if (developerTagDefined) {
		if (!muteChannel) {
			outputChannel.appendLine("Loaded developer tag from local config file with value: " + developerTag);
		}
	}

	if (pboPrefixDefined) {
		if (!muteChannel) {
			outputChannel.appendLine("Loaded PBO prefix from local config file with value: " + pboPrefix);
		}
	}

	if (debugEnabledDefined) {
		if (!muteChannel) {
			outputChannel.appendLine("Loaded functions' debug parameter from local config file with value: " + debugEnabled);
		}
	}

	if (allowRemoteExecDefined) {
		if (!muteChannel) {
			outputChannel.appendLine("Loaded unrestrained remote execution allowed parameter from local config with value: " + allowRemoteExec);
		}
	}

	if (!muteChannel) {
		outputChannel.appendLine("---");
	}

	if (!developerTagDefined) {
		developerTag = vscode.workspace.getConfiguration().get('cfgfunctionsTag') ?? 'YOUR_TAG_HERE';
		if (developerTag == '') {
			developerTag = 'YOUR_TAG_HERE';
		}
	}
	
	if (!debugEnabledDefined) {
		debugEnabled = vscode.workspace.getConfiguration().get('debugEnabled') ?? false;
	}

	if (!pboPrefixDefined) {
		pboPrefix= vscode.workspace.getConfiguration().get('pboPrefix') ?? '';
	}

	if (pboPrefix !== "") {
		pboPrefix = pboPrefix + path.sep; 
	}

	if (!allowRemoteExecDefined) {
		allowRemoteExec = vscode.workspace.getConfiguration().get('allowRemoteExec') ?? false;
	}

	return [developerTag, pboPrefix, debugEnabled, allowRemoteExec];
}

function formatFunctionClass(sqfFileURI: vscode.Uri, outputChannel: vscode.OutputChannel, pboPrefix: string) {
	let functionName = "";
	let preInit = false;
	let postInit = false;
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

			functionName = functionName.replace("fn", "");

			functionName = cleanUnderscores(functionName);

			if (functionName.toLowerCase().startsWith('preinit')) {
				preInit = true;

				if (!functionName.startsWith('preInit')) {
					outputChannel.appendLine("Function \"" + functionName + "\" has misnamed \"preInit\" attribute. Please use camelCase formatting.")
					vscode.window.showWarningMessage("There were warnings during creation of CfgFunctions. Check the output channel for more information.")
				}

				functionName = functionName.replace("preInit", "");
			}

			if (functionName.toLowerCase().startsWith('postinit')) {
				postInit = true;

				if (!functionName.startsWith('postInit')) {
					outputChannel.appendLine("Function \"" + functionName + "\" has misnamed \"postInit\" attribute. Please use camelCase formatting.")
					vscode.window.showWarningMessage("There were warnings during creation of CfgFunctions. Check the output channel for more information.")
				}

				functionName = functionName.replace("postInit", "");
			}

			functionName = cleanUnderscores(functionName);

			const regExpAll = /all/i;
			const regExpServer = /server/i;
			const regExpClient = /client/i;
			const JIPallowed = /jip/i;

			if (functionName.toLowerCase().startsWith('jip')) {
				functionName = functionName.replace(JIPallowed, "");
			}

			functionName = cleanUnderscores(functionName);

			if (functionName.toLowerCase().startsWith('all')) {
				functionName = functionName.replace(regExpAll, "");
				
			}

			functionName = cleanUnderscores(functionName);

			if (functionName.toLowerCase().startsWith('client')) {
				functionName = functionName.replace(regExpClient, ""); 	
			}

			functionName = cleanUnderscores(functionName);

			if (functionName.toLowerCase().startsWith('server')) {
				functionName = functionName.replace(regExpServer, "");
			}

			functionName = cleanUnderscores(functionName);

			if (functionName.toLowerCase().startsWith('jip')) {
				functionName = functionName.replace(JIPallowed, "");
			}

			functionName = cleanUnderscores(functionName);

			functionPath = pboPrefix + functionDirPath + path.sep + sqfFilename;

			if (depth > 2) {
				let functionDirPathSplitReversed = functionDirPathSplit.reverse();
				subcategory = functionDirPathSplitReversed[depth - (depth - (depth - 3))];

				returnValue = nestedFolderFunctionName(subcategory, functionName, functionPath, preInit, postInit);
			}

			else if (depth === 2) {
				returnValue = coreFunctionName(functionName, functionPath, preInit, postInit);

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

function cleanUnderscores(functionName: string) {
	while (functionName.startsWith("_")) {
		functionName = functionName.replace("_", "");
	}

	return functionName;
}

function nestedFolderFunctionName(subcategory: string, functionName: string, functionPath: string, preInit: boolean, postInit: boolean) {
	if (preInit) {
		return "class " + subcategory + "_" + functionName + " { file = \"" + functionPath + "\"; preInit = 1; };";
	}

	if (postInit) {
		return "class " + subcategory + "_" + functionName + " { file = \"" + functionPath + "\"; postInit = 1; };"
	}

	return "class " + subcategory + "_" + functionName + " { file = \"" + functionPath + "\"; };"
}

function coreFunctionName(functionName: string, functionDirPath: string, preInit: boolean, postInit: boolean) {
	if (preInit) {
		return "class " + functionName + " { file = \"" + functionDirPath + "\"; preInit = 1; };";
	}

	if (postInit) {
		return "class " + functionName + " { file = \"" + functionDirPath + "\"; postInit = 1; };";
	}
	
	return "class " + functionName + " { file = \"" + functionDirPath + "\"; };";
}

function loadCfgFunctionsCompletion(context: vscode.ExtensionContext, cfgFunctionsPath: string, developerTag: string) {

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

	for (const line of cfgFunctionsFncsIterator) {
		const lineStr = line.toString();
		const functionName = developerTag + "_fnc_" + (lineStr.substring(lineStr.indexOf("class ") + 6, (lineStr.indexOf(" { file = "))));
		cfgFunctionsFncsFormatted.push(functionName);
	}

	const provider = vscode.languages.registerCompletionItemProvider('sqf', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			const cmpItems = new Array<vscode.CompletionItem>;

			for (const fnc of cfgFunctionsFncsFormatted) {
				
				const cmpItem = new vscode.CompletionItem(fnc, vscode.CompletionItemKind.Function);

				if (!(cmpItems.includes(cmpItem))) {
					cmpItems.push(cmpItem);
				}
			}

			return cmpItems;
		}

	}

	);
	
	context.subscriptions.push(provider);

	return provider;
}

function generateCfgRemoteExec(context: vscode.ExtensionContext) {

	let muteChannel = false;

	const outputChannel = vscode.window.createOutputChannel("Arma 3 CfgRemoteExec.hpp Generator");

	const options = getOptions(outputChannel, muteChannel);

	let errorsFound = false;
	let content =
			"\n" +
			"#define ALL 0\n" +
			"#define CLIENT 1\n" +
			"#define SERVER 2\n" +
			"\n" +
			"class CfgRemoteExec\n" +
			"{\n" +
			"\n" +
			"\tclass " + "Functions" + "\n" +
			"\t{\n" +
			"\n" +
			"\t\t" + "// --------------------------------" + "\n" +
			"\t\t" + "// MODE values:" + "\n" +
			"\t\t" + "// 0 = Remote execution blocked completely." + "\n" +
			"\t\t" + "// 1 = Only whitelisted functions are allowed. (RECOMMENDED)" + "\n" +
			"\t\t" + "// 2 = remote execution fully allowed (no whitelist) - not recommended for production." + "\n" +
			"\t\t" + "\n" +
			"\t\t" + "// Only whitelisted functions are allowed." + "\n";

			// AllowRemoteExec parameter
			if (options[3] == true) {
				content += "\t\t" + "mode = 2;";
			} else {
				content += "\t\t" + "mode = 1;";
			}
			
			content += "\n\n" + "\n" +
			"\t\t" + "// --------------------------------" + "\n" +
			"\t\t" + "// JIP values:" + "\n" +
			"\t\t" + "// 0 = JIP flag can be set by function or command only if they override the JIP flag in their declaration in this file. (RECOMMENDED)" + "\n" +
			"\t\t" + "// 1 = JIP flag can always be set - not recommended for production." + "\n" +
			"\t\t" + "\n" +
			"\t\t" + "// JIP flag can not be set (unless overridden by a function or command declaration itself)." + "\n" + 
			"\t\t" + "jip = 0;" + 
			"\n\n" +
			"\n\n";

	const cfgFunctionsPath = vscode.window.activeTextEditor?.document.uri.fsPath;

	const outputChannelRemoteExec = vscode.window.createOutputChannel("Arma 3 CfgRemoteExec generator");

	outputChannelRemoteExec.show();

	outputChannelRemoteExec.appendLine("###  ARMA 3 CFGREMOTEEXEC GENERATOR  ###");
	outputChannelRemoteExec.appendLine("---");

	outputChannelRemoteExec.appendLine("Generating CfgRemoteExec.hpp.");
	outputChannelRemoteExec.appendLine("---");

	if (cfgFunctionsPath === undefined) {
		vscode.window.showErrorMessage("Error! Make sure that you've clicked the editor area of your CfgFunctions.hpp before running the CfgRemoteExec generation task.");
		outputChannelRemoteExec.appendLine("Error! Make sure that you've clicked the editor area of your CfgFunctions.hpp before running the CfgRemoteExec generation task.");
		errorsFound = true;
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

	muteChannel = false;

	const developerTag = options[0];

	for (const line of cfgFunctionsFncsIterator) {
		const lineStr = line.toString();
		const functionName = formatRemoteExecFunction(String(developerTag), lineStr, outputChannelRemoteExec);
		cfgFunctionsFncsFormatted.push(functionName);
	}

	const cfgFunctionsFncsFormattedIterator = cfgFunctionsFncsFormatted.values();

	for (const fnc of cfgFunctionsFncsFormattedIterator) {
		let fncRemoteExecClassString = fnc;

		content += fncRemoteExecClassString;
	}

	content += "\t};"

	content += "\n\n" + 
		"class Commands" + "\n" + "\t{" + "\n" +
		"\t\t" + "// Only whitelisted commands are allowed. Other values: 0 = remote execution blocked, 2 = remote execution fully allowed (no whitelist)" + "\n";
		
		// AllowRemoteExec parameter
		if (options[3] == true) {
			content += "\t\t" + "mode = 2;";
		} else {
			content += "\t\t" + "mode = 1;";
		}

		content += "\n\n" +
		"\t\t" + "// Note that blocking raw SQF command input is recommended. You should whitelist only the functions above (and not pure SQF commands!) because of security reasons." + "\n" +
		"\t\t" + "// See more info (and a super useful trick to increase security of your project) at the comments seffction of https://community.bistudio.com/wiki/remoteExec" + "\n" +
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

	outputChannelRemoteExec.appendLine("---");
	outputChannelRemoteExec.appendLine("");
	outputChannelRemoteExec.appendLine("Generation of CfgRemoteExec.hpp finished.");

}

function formatRemoteExecFunction(developerTag: string, lineStr: string, outputChannelRemoteExec: vscode.OutputChannel) {

	let functionName = "";
	let rawFunctionName = "";
	let remoteExecServer = false;
	let remoteExecClient = false;
	let remoteExecAll = false;
	let JIPallowed = false;

	functionName = developerTag + "_fnc_" + (lineStr.substring(lineStr.indexOf("class ") + 6, (lineStr.indexOf(" { file = "))));
	
	rawFunctionName = (lineStr.substring(lineStr.indexOf("class ") + 6, (lineStr.indexOf(" { file = "))));

	let cfgRemoteExecFunctionParams =
		"\t\t" + "class " + functionName + "\n" +
		"\t\t" + "{" + "\n";

		if (lineStr.toLowerCase().includes('_all_')) {

			remoteExecAll = true;
	
			if (!lineStr.includes('_ALL_')) {
				outputChannelRemoteExec.appendLine("Function file \"" + rawFunctionName + "\" has misnamed remote execution target attribute (ALL). Please use UPPERCASE formatting.")
				vscode.window.showWarningMessage("There were warnings during creation of CfgRemoteExec. Check the output channel for more information.")
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = ALL;" + "\n";
			} else {
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = ALL;" + "\n";
			}

		} else if (lineStr.toLowerCase().includes('_server_')) {

			remoteExecServer = true;
	
			if (!lineStr.includes('_SERVER_')) {
				outputChannelRemoteExec.appendLine("Function file \"" + rawFunctionName + "\" has misnamed remote execution target attribute (SERVER). Please use UPPERCASE formatting.")
				vscode.window.showWarningMessage("There were warnings during creation of CfgRemoteExec. Check the output channel for more information.")
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = SERVER;" + "\n";
			} else {
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = SERVER;" + "\n";
			}

		} else if (lineStr.toLowerCase().includes('_client_')) {

			remoteExecClient = true;
		
			if (!lineStr.includes('_CLIENT_')) {
				outputChannelRemoteExec.appendLine("Function file \"" + rawFunctionName + "\" has misnamed remote execution target attribute (CLIENT). Please use UPPERCASE formatting.")
				vscode.window.showWarningMessage("There were warnings during creation of CfgRemoteExec. Check the output channel for more information.")
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = CLIENT;" + "\n";
			} else {
				cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = CLIENT;" + "\n";
			}

		} else {
			cfgRemoteExecFunctionParams += "\t\t\t" + "allowedTargets = ALL;" + "    // ATTN! \"allowedTargets\" parameter value not explicitly set! Using default value (not recommended)." + "\n";
		}

		if (lineStr.toLowerCase().includes('_jip_')) {

			JIPallowed = true;
	
			if (!lineStr.includes('_JIP_')) {
				outputChannelRemoteExec.appendLine("Function file \"" + rawFunctionName + "\" has misnamed remote execution JIP (Join In Progress) attribute. Please use UPPERCASE formatting.")
				vscode.window.showWarningMessage("There were warnings during creation of CfgRemoteExec. Check the output channel for more information.")
				cfgRemoteExecFunctionParams += "\t\t\t" + "jip = 1;" + "\n";
			} else {
				cfgRemoteExecFunctionParams += "\t\t\t" + "jip = 1;" + "\n";
			}
		} else {
			cfgRemoteExecFunctionParams += "\t\t\t" + "jip = 0;" + "\n";
		}

	cfgRemoteExecFunctionParams += "\t\t}; \n\n";

	// Check whether we need to include the function in CfgRemoteExec.hpp or not
	if (!(remoteExecAll || remoteExecClient || remoteExecServer || JIPallowed)) {
		cfgRemoteExecFunctionParams = "";
	}

	return cfgRemoteExecFunctionParams;
}
