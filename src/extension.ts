import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.flutter-create-wizard', async () => {
		let projectName = await vscode.window.showInputBox({placeHolder: 'Project Name (Default: flutter_app)', prompt: 'Project Name (Default: flutter_app)'}).then((_projectName) => {
			if (_projectName == '')
				_projectName = 'flutter_app';
			return _projectName;
		});

		projectName = projectName?.toLowerCase();

		let folderName = await vscode.window.showInputBox({placeHolder: 'Folder Name (Default: Same as Project Name)', prompt: 'Folder Name (Default: Same as Project Name)'}).then((_folderName) => {
			if (_folderName == '')
				_folderName = projectName;
			return _folderName;
		});

		let androidLanguage = await vscode.window.showInputBox({placeHolder: 'Android Language (Default: java)', prompt: 'Android Language (Default: java)'}).then((_androidLanguage) => {
			if (_androidLanguage == '' || _androidLanguage != 'java' && _androidLanguage != 'kotlin')
				_androidLanguage = 'java';
			return _androidLanguage;
		});

		let iosLanguage = await vscode.window.showInputBox({placeHolder: 'iOS Language (Default: objc)', prompt: 'iOS Language (Default: objc)'}).then((_iosLanguage) => {
			if (_iosLanguage == '' || _iosLanguage != 'objc' && _iosLanguage != 'swift')
				_iosLanguage = 'objc';
			return _iosLanguage;
		});

		let orgName = await vscode.window.showInputBox({placeHolder: 'Org Name (Default: com.example)', prompt: 'Org Name (Default: com.example)'}).then((_orgName) => {
			if (_orgName == '')
				_orgName = 'com.example';
			return _orgName;
		});

		let projectDirectory = await vscode.window.showOpenDialog({canSelectFolders: true, canSelectFiles: false, defaultUri: undefined}).then((_projectDirectory) => {
			return _projectDirectory?.[0]['path'];
		});

		if (projectDirectory == undefined) {
			vscode.window.showInformationMessage('Please Specify Directory');
			return;
		}

		projectDirectory += '/' + folderName;

		try {
			readdirSync(projectDirectory);
			vscode.window.showInformationMessage('Same project exists');
			return;
		} catch (e) {
			
		}

		// flutter create
		execSync('flutter create --org ' + orgName + ' --project-name ' + projectName + ' -a ' + androidLanguage + ' -i ' + iosLanguage + ' ' + projectDirectory);
		
		// open project in vscode
		execSync('code ' + projectDirectory);
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}