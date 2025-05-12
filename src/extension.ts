import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('🚀 Extension Activated');

  const disposable = vscode.commands.registerCommand('pythonSummariser.summariseCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return vscode.window.showErrorMessage('No active editor found.');
    }

    const code = editor.document.getText(editor.selection);
    if (!code.trim()) {
      return vscode.window.showWarningMessage('Please select Python code to summarise.');
    }

    const panel = vscode.window.createWebviewPanel(
      'codeSummary',
      '🧠 Summary + Suggestions',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.webview.html = getLoadingHtml();

    try {
      const summary = await getSummaryFromAI(code);
      panel.webview.html = getWebviewContent(summary);

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === 'export') {
            try {
              const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('summary.md'),
                filters: { Markdown: ['md'] },
              });

              if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(message.text, 'utf8'));
                vscode.window.showInformationMessage(`Summary exported to ${uri.fsPath}`);
              } else {
                vscode.window.showWarningMessage('Export cancelled.');
              }
            } catch (err: any) {
              vscode.window.showErrorMessage(`Failed to export: ${err.message}`);
            }
          }
        },
        undefined,
        context.subscriptions
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error summarising code: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

interface OpenAIResponse {
  choices: { message: { content: string } }[];
}
/**
 * Retrieves a summary from the OpenAI API.
 * 
 * The OpenAI API key must be supplied in your `.vscode/launch.json` like so:
 * 
 * ```json
 * "env": {
 *   "OPENAI_API_KEY": "your-api-key"
 * }
 * ```
 * 
 * This key is not included in the repository for security reasons.
 */

async function getSummaryFromAI(code: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key. Add it to your .env file.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that explains Python code and suggests improvements.' },
        { role: 'user', content: `Explain and suggest improvements for this Python code:\n\n${code}` }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${errorText}`);
  }

  const data = await response.json() as OpenAIResponse;
  return data.choices[0].message.content.trim();
}

function getLoadingHtml(): string {
  return `
    <html>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h3>⏳ Generating summary...</h3>
      </body>
    </html>
  `;
}

function getWebviewContent(summary: string): string {
  const escapedText = JSON.stringify(summary);
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        :root {
          color-scheme: light dark;
        }
        body {
          font-family: sans-serif;
          padding: 1rem;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .summary {
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          border: 1px solid var(--vscode-editorWidget-border);
          padding: 1rem;
          border-radius: 6px;
        }
        button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
      </style>
    </head>
    <body>
      <div class="summary">${summary}</div>
      <button onclick="exportToMarkdown()">📤 Export to Markdown</button>
      <script>
        const vscode = acquireVsCodeApi();
        const content = ${escapedText};
        function exportToMarkdown() {
          vscode.postMessage({
            command: 'export',
            text: content
          });
        }
      </script>
    </body>
    </html>
  `;
}
