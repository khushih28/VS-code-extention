const vscode = require("vscode");
const axios = require("axios");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.generateUnitTests",
    async function () {
      // Prompt the user to enter a code snippet
      const codeSnippet = await vscode.window.showInputBox({
        placeHolder:
          "Enter a code snippet (e.g., a Python function to add two numbers)",
        prompt: "Make sure to enter a complete function for best results.",
      });

      if (!codeSnippet) {
        vscode.window.showInformationMessage("No code snippet entered.");
        return;
      }

      vscode.window.showInformationMessage(
        "Unit tests generation in progress..."
      );

      try {
        // Refined prompt with better clarity on task
        const prompt = `Generate comprehensive unit tests for the following code snippet:
        Code: ${codeSnippet}
        Task: Create unit tests that cover edge cases and validate expected behavior.
        Please retain the original code in your response.`;

        // Send the prompt to the Cohere API to generate unit tests
        const response = await axios.post(
          "https://api.cohere.ai/v1/generate",
          {
            model: "command-r-08-2024",
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.5,
            k: 5,
            p: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer YOUR_API_KEY`, // Open API key
            },
          }
        );

        // Log the full response for debugging
        console.log("Full API response:", JSON.stringify(response.data));

        let generatedTests = "";
        if (response.data.generations && response.data.generations.length > 0) {
          generatedTests = response.data.generations[0].text.trim();
        } else {
          generatedTests = "No valid unit tests returned from the API.";
        }

        console.log("Generated unit tests:", generatedTests);

        const editor = vscode.window.activeTextEditor;

        if (editor) {
          // Insert the generated unit tests into the active editor
          await editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, generatedTests);
          });
          vscode.window.showInformationMessage(
            "Unit tests successfully generated and inserted."
          );
        } else {
          vscode.window.showWarningMessage(
            "No active editor found. Unable to insert generated unit tests."
          );
        }
      } catch (error) {
        // Enhanced error handling
        if (error.response) {
          console.error("Error response data:", error.response.data);
          vscode.window.showErrorMessage(
            `API request failed: ${error.response.status} - ${
              error.response.data.error || "Unknown error"
            }`
          );
        } else if (error.request) {
          vscode.window.showErrorMessage("No response received from API.");
        } else {
          vscode.window.showErrorMessage(
            "Error generating unit tests: " + error.message
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {
  console.log("Extension deactivated.");
}

module.exports = {
  activate,
  deactivate,
};








