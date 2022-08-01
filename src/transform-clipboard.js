const vscode = require('vscode');
const interfaceBuilder = require("./interface-builder");

module.exports = vscode.commands.registerCommand('interface-transform.transformClipboard', function () {
    // vscode.window.showInputBox({
    //     password: false, // 输入内容是否是密码
    //     ignoreFocusOut: true, // 点击其它地方输入框是否消失，true不消失，默认为false
    //     placeHolder: "请输入您要进行转换的json",
    //     prompt: "内部使用，仅针对特定格式有效",
    //     validateInput: (text) => {
    //         return text;
    //     },
    // });
    const indent = vscode.workspace.getConfiguration().get("InterfaceTransform.indent");
    const semicolonEnd = vscode.workspace.getConfiguration().get("InterfaceTransform.semicolonEnd");
    // console.log("indent", indent);

    // 获取选中的文本
    const currentEditor = vscode.window.activeTextEditor;
    vscode.env.clipboard.readText().then((res) => {

        if (!res) {
            return;
        }
    
        // 将选中文本根据用户配置转换成 ts interface
        const {interfaceCode, isError} = interfaceBuilder(res, {
            indent,
            semicolonEnd,
        });
    
        // console.log("interfaceCode", interfaceCode);
        
        if (isError === true) {
            vscode.window.showErrorMessage('InterfaceTransform转换失败!');
            return;
        }
    
        if (interfaceCode === "") {
            return;
        }
    
        // 插入转换后的 ts interface
        currentEditor.edit((editBuilder) => {
            const position = new vscode.Position(currentEditor.selection.active.line, currentEditor.selection.active.character)
            editBuilder.insert(position, interfaceCode);
        })
    });

});