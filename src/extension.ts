import * as vscode from 'vscode';
import * as fastglob from 'fast-glob';
import uripath from 'file-uri-to-path';
import path from 'path';
import fs from 'fs';

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

		const currentFileString = vscode.window.activeTextEditor?.document.uri.fsPath.toString();

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
}

// This method is called when your extension is deactivated
export function deactivate() {}

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
		let sqfFilename = sqfFileStringSplit.at(-1);

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

