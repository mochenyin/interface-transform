const transform = require("./transform.js");
const message = require("./message.js");
const transformC = require("./transform-clipboard.js");
const mockClipboardData = require("./mock-clipboard-data.js");

function activate(context) {
	context.subscriptions.push(message);
    context.subscriptions.push(transform);
	context.subscriptions.push(transformC);
	context.subscriptions.push(mockClipboardData);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}