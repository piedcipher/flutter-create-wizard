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

			let androidLanguage = await vscode.window.showQuickPick(
				['kotlin', 'java'],
				{ placeHolder: 'Android Language' }
			);
			let iosLanguage = await vscode.window.showQuickPick(
				['swift', 'objc'],
				{ placeHolder: 'iOS Language' }
			);

			let orgName = await vscode.window
				.showInputBox({
					placeHolder: 'Org Name (Default: com.example.project_name)',
					prompt: 'Org Name (Default: com.example.project_name)'
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

			projectDirectory = path.join(projectDirectory, projectName);

			if (existsSync(projectDirectory)) {
				vscode.window.showInformationMessage('Same project exists');
				return;
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

			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'Creating ' + projectName,
					cancellable: true
				},
				(_, token) => {
					var newpath = path.join(
						(<vscode.Uri>directoyUri).fsPath,
						projectName
					);
					token.onCancellationRequested(() => {
						console.log('Project creation canceled');
					});

					var p = new Promise(async _ => {
						exec(createCommand, error => {
							console.log(error);

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
					});

					return p;
				}
			);
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
