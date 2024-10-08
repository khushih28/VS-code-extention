const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generateUnitTests', async function () {
        // Prompt the user to enter a code snippet
        const codeSnippet = await vscode.window.showInputBox({
            placeHolder: "Enter a code snippet (e.g., a Python function to add two numbers)",
            prompt: "Make sure to enter a complete function for best results."
        });

        if (!codeSnippet) {
            vscode.window.showInformationMessage("No code snippet entered.");
            return;
        }

        vscode.window.showInformationMessage("Unit tests generation in progress...");

        try {
            // Create a more detailed prompt to guide the model
            const prompt = `Generate comprehensive unit tests for the following Python function:\n${codeSnippet}\n\nPlease ensure that all edge cases are covered.`;

            // Send the prompt to the SantaCoder API to generate unit tests
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/bigcode/santacode',
                {
                    inputs: prompt
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer api_key` // Use environment variable
                    }
                }
            );

            // Log the full response for debugging
            console.log('Full API response:', response.data);

            let generatedTests = '';
            if (response.data && response.data.generated_text) {
                generatedTests = response.data.generated_text.trim();
            } else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].generated_text) {
                generatedTests = response.data[0].generated_text.trim();
            } else {
                generatedTests = 'No valid unit tests returned from the API.';
            }

            console.log('Generated unit tests:', generatedTests);

            const editor = vscode.window.activeTextEditor;

            if (editor) {
                // Insert the generated unit tests into the active editor
                await editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, generatedTests);
                });
                vscode.window.showInformationMessage('Unit tests successfully generated and inserted.');
            } else {
                vscode.window.showWarningMessage('No active editor found. Unable to insert generated unit tests.');
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response data:', error.response.data);
                vscode.window.showErrorMessage(`API request failed: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                vscode.window.showErrorMessage('No response received from API.');
            } else {
                vscode.window.showErrorMessage('Error generating unit tests: ' + error.message);
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










