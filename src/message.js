const vscode = require('vscode');

module.exports = vscode.commands.registerCommand('interface-transform.helloWorld', function () {
    vscode.window.showInformationMessage('interface-transform 已启动!');
});