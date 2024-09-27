const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Registering the command which will be executed when invoked
    let disposable = vscode.commands.registerCommand('extension.generateCode', async function () {
        console.log('Command extension.generateCode is invoked.');

        // Prompt the user to enter a task for code generation
        const prompt = await vscode.window.showInputBox({ placeHolder: "Enter a task (e.g., 'create a Python factorial function')" });
        console.log('Prompt received:', prompt);  // Log the received prompt

        // Check if prompt is empty
        if (!prompt) {
            vscode.window.showInformationMessage("No prompt entered.");
            return; // Exit if no prompt
        }

        // Confirm to user that request is being sent
        vscode.window.showInformationMessage(`Sending request to API for: "${prompt}"`);
        console.log('Command is executing, preparing to send request...');

        try {
            console.log('Sending request to Hugging Face API...');
            const response = await axios.post('https://api-inference.huggingface.co/models/bigcode/santacoder', {
                inputs:`${prompt}`,  
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer "your api key'  // Using the API key
                }
            });

            // Log the full response from the API
            console.log('Full response from API:', response.data); 

            // Check if the response contains code
            let code;
            if (typeof response.data === 'string') {
                code = response.data.trim();
            } else if (response.data.code) {
                code = response.data.code.trim();
            } else {
                code = 'No code returned from the API.';
            }

            // Log the code being inserted
            console.log('Generated code:', code);

            const editor = vscode.window.activeTextEditor;

            // If there's an active editor, insert the generated code at the cursor's position
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, code);
                });
                // Notify user of successful insertion
                vscode.window.showInformationMessage('Code successfully generated and inserted.');
            } else {
                vscode.window.showWarningMessage('No active editor found. Unable to insert generated code.');
            }

        } catch (error) {
            // Handle different error types
            console.error('Error during API request:', error); // Log the error for debugging
            if (error.response) {
                vscode.window.showErrorMessage(`API request failed with status: ${error.response.status}`);
                console.error('Error response from API:', error.response);
            } else if (error.request) {
                vscode.window.showErrorMessage('No response received from API.');
                console.error('No response received:', error.request);
            } else {
                vscode.window.showErrorMessage('Error generating code: ' + error.message);
                console.error('Error details:', error.message);
            }
        }
    });

    // Push the command to the extension's subscriptions
    context.subscriptions.push(disposable);
}

// Method called when the extension is deactivated
function deactivate() {
    console.log('Extension deactivated.');
}

module.exports = {
    activate,
    deactivate
};






