const vscode = require('vscode');
const transform = require("./transform.js");
const message = require("./message.js");
const transformC = require("./transform-clipboard.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(message);
    context.subscriptions.push(transform);
	context.subscriptions.push(transformC);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}