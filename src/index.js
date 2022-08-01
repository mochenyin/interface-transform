const vscode = require('vscode');
const transform = require("./transform.js");
const message = require("./message.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(message);
    context.subscriptions.push(transform);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}