import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.flutter-create-wizard', async () => {
		let projectName = await vscode.window.showInputBox({placeHolder: 'Project Name (Default: flutter_app)'}).then((_projectName) => {
			if (_projectName == '')
				_projectName = 'flutter_app';
			return _projectName;
		});

		let androidLanguage = await vscode.window.showInputBox({placeHolder: 'Android Language (Default: java)'}).then((_androidLanguage) => {
			if (_androidLanguage == '' || _androidLanguage != 'java' && _androidLanguage != 'kotlin')
				_androidLanguage = 'java';
			return _androidLanguage;
		});

		let iosLanguage = await vscode.window.showInputBox({placeHolder: 'iOS Language (Default: objc)'}).then((_iosLanguage) => {
			if (_iosLanguage == '' || _iosLanguage != 'objc' && _iosLanguage != 'swift')
				_iosLanguage = 'objc';
			return _iosLanguage;
		});

		let orgName = await vscode.window.showInputBox({placeHolder: 'Org Name (Default: com.example)'}).then((_orgName) => {
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

		projectDirectory += '/';

		const {execSync} = require('child_process');	

		execSync('flutter create --org ' + orgName + ' --project-name ' + projectName + ' -a ' + androidLanguage + ' -i ' + iosLanguage + ' ' + projectDirectory + projectName);
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}