import * as vscode from 'vscode';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'extension.flutter-create-wizard',
		async () => {
			let projectName = await vscode.window
				.showInputBox({
					placeHolder: 'Project Name (Default: flutter_app)',
					prompt: 'Project Name (Default: flutter_app)',
					validateInput: validateFlutterProjectName
				})
				.then(_projectName => {
					if (typeof _projectName === 'undefined') {
						console.log(typeof _projectName);
						return Promise.reject('Canceled Flutter Create Wizard');
					}
					if (_projectName === '') {
						_projectName = 'flutter_app';
					}
					return _projectName;
				});

			// projectName = projectName?.trim().toLowerCase().replace(' ', "_");

			let folderName = await vscode.window
				.showInputBox({
					placeHolder: 'Folder Name (Default: Same as Project Name)',
					prompt: 'Folder Name (Default: Same as Project Name)'
				})
				.then(_folderName => {
					if (typeof _folderName === 'undefined') {
						console.log(typeof _folderName);
						return Promise.reject('Canceled Flutter Create Wizard');
					}
					if (_folderName === '') {
						_folderName = projectName;
					}
					return _folderName;
				});

			let androidLanguage = await vscode.window
				.showInputBox({
					placeHolder: 'Default: java',
					prompt: 'Android language: java or kotlin ?',
					validateInput: value => {
						if (
							value === 'java' ||
							value === 'kotlin' ||
							value === ''
						) {
							return null;
						} else {
							return 'Please enter a correct language for android (java or kotlin)';
						}
					}
				})
				.then(_androidLanguage => {
					if (typeof _androidLanguage === 'undefined') {
						console.log(typeof _androidLanguage);
						return Promise.reject('Canceled Flutter Create Wizard');
					}
					if (_androidLanguage === '') {
						return 'java';
					} else {
						return _androidLanguage;
					}
				});

			let iosLanguage = await vscode.window
				.showInputBox({
					placeHolder: 'iOS Language (Default: objc)',
					prompt: 'iOS language: objc or swift ?',
					validateInput: value => {
						if (
							value === 'objc' ||
							value === 'swift' ||
							value === ''
						) {
							return null;
						} else {
							return 'Please enter a correct language for iOS (objc or kotlin)';
						}
					}
				})
				.then(_iosLanguage => {
					if (typeof _iosLanguage === 'undefined') {
						console.log(typeof _iosLanguage);
						return Promise.reject('Canceled Flutter Create Wizard');
					}
					if (_iosLanguage === '') {
						return 'objc';
					} else {
						return _iosLanguage;
					}
				});

			let orgName = await vscode.window
				.showInputBox({
					placeHolder: 'Org Name (Default: com.example)',
					prompt: 'Org Name (Default: com.example)'
				})
				.then(_orgName => {
					if (typeof _orgName === 'undefined') {
						console.log(typeof _orgName);
						return Promise.reject('Canceled Flutter Create Wizard');
					}
					if (_orgName === '') {
						_orgName = 'com.example';
					}
					return _orgName;
				});

			var directoyUri: string | vscode.Uri;
			let projectDirectory = await vscode.window
				.showOpenDialog({
					canSelectFolders: true,
					canSelectFiles: false,
					defaultUri: undefined
				})
				.then(_projectDirectory => {
					directoyUri =
						_projectDirectory === undefined
							? ''
							: _projectDirectory[0];
					return _projectDirectory?.[0].fsPath;
				});

			if (projectDirectory === undefined) {
				vscode.window.showInformationMessage(
					'Please Specify Directory'
				);
				return;
			}

			projectDirectory = path.join(projectDirectory, folderName);

			if (existsSync(projectDirectory)) {
				vscode.window.showInformationMessage('Same project exists');
				return;
			}

			if (projectDirectory.startsWith('/')) {
				projectDirectory = projectDirectory.substring(1);
			}

			// flutter create
			var createCommand =
				'flutter create' +
				' --org ' +
				orgName +
				' --project-name ' +
				projectName +
				' -a ' +
				androidLanguage +
				' -i ' +
				iosLanguage +
				' ' +
				projectDirectory;

			exec(createCommand, (error, stdout, stderr) => {
				console.log(error);
				var newpath = path.join(
					(<vscode.Uri>directoyUri).fsPath,
					folderName
				);
				const hasFoldersOpen = !!(
					vscode.workspace.workspaceFolders &&
					vscode.workspace.workspaceFolders.length
				);
				const openInNewWindow = hasFoldersOpen;
				vscode.commands.executeCommand(
					'vscode.openFolder',
					vscode.Uri.file(newpath),
					openInNewWindow
				);
			});
		}
	);
	context.subscriptions.push(disposable);
}

const packageNameRegex = new RegExp('^[a-z][a-z0-9_]*$');

function validateFlutterProjectName(input: string) {
	if (input === '') {
		return null;
	}
	if (!packageNameRegex.test(input)) {
		return 'Flutter project names should be all lowercase, with underscores to separate words';
	}
	const bannedNames = ['flutter', 'flutter_test', 'test'];
	if (bannedNames.indexOf(input) !== -1) {
		return `You may not use ${input} as the name for a flutter project`;
	}
}

export function deactivate() {}
