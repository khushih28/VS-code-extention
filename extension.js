const vscode = require('vscode');
const axios = require('axios');

/** 
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generateCode', async function () {
        const prompt = await vscode.window.showInputBox({ placeHolder: "Enter a task (e.g., 'create a Python factorial function')" });

        if (!prompt) {
            vscode.window.showInformationMessage("No prompt entered.");
            return;
        }

        vscode.window.showInformationMessage(`Sending request to API for: "${prompt}"`);

        try {
            const response = await axios.post('https://api-inference.huggingface.co/models/bigcode/santacoder', {
                inputs: prompt,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer Your_api_key`,
                }
            });

            // Log the full response to inspect its structure
            console.log('Full response from API:', response.data);

            let code;
            if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].generated_text) {
                code = response.data[0].generated_text.trim();
            } else {
                code = 'No code returned from the API.';
            }

            console.log('Generated code:', code);

            const editor = vscode.window.activeTextEditor;

            if (editor) {
                editor.edit(editBuilder => {
                    // Insert code at the active cursor position
                    editBuilder.insert(editor.selection.active, code);
                }).then(success => {
                    if (success) {
                        vscode.window.showInformationMessage('Code successfully generated and inserted.');
                    } else {
                        vscode.window.showWarningMessage('Failed to insert generated code.');
                    }
                });
            } else {
                vscode.window.showWarningMessage('No active editor found. Unable to insert generated code.');
            }
        } catch (error) {
            if (error.response) {
                vscode.window.showErrorMessage(`API request failed with status: ${error.response.status}`);
            } else if (error.request) {
                vscode.window.showErrorMessage('No response received from API.');
            } else {
                vscode.window.showErrorMessage('Error generating code: ' + error.message);
            }
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
    console.log('Extension deactivated.');
}

module.exports = {
    activate,
    deactivate
};








