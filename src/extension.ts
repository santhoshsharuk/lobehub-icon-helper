import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('🔹 LobeHub Icon Helper Activated');

    const disposable = vscode.commands.registerCommand('lobehubIcons.searchIcon', async () => {
        const iconNamesInput = await vscode.window.showInputBox({
            prompt: 'Enter icon names separated by commas (e.g., home,user,search)'
        });
        if (!iconNamesInput) return;

        const iconNames = iconNamesInput.split(',').map(i => i.trim());
        const iconContents: { name: string; svg: string }[] = [];

        for (const iconName of iconNames) {
            const url = `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${iconName}.svg`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    vscode.window.showWarningMessage(`Icon '${iconName}' not found`);
                    continue;
                }
                const svgContent = await res.text();
                iconContents.push({ name: iconName, svg: svgContent });
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to fetch icon '${iconName}': ${err}`);
            }
        }

        if (iconContents.length === 0) return;

        // Show Webview
        const panel = vscode.window.createWebviewPanel(
            'iconGallery',
            'LobeHub Icon Gallery',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Build gallery HTML
        const galleryHtml = iconContents.map(icon => `
            <div class="icon-container" draggable="true" data-name="${icon.name}">
                ${icon.svg}
                <p>${icon.name}</p>
            </div>
        `).join('');

        panel.webview.html = `
        <html>
        <head>
            <style>
                body { display: flex; flex-wrap: wrap; gap: 20px; padding: 10px; }
                .icon-container { width: 100px; cursor: grab; text-align: center; }
                .icon-container svg { width: 80px; height: 80px; }
            </style>
        </head>
        <body>
            ${galleryHtml}
            <script>
                const vscode = acquireVsCodeApi();
                document.querySelectorAll('.icon-container').forEach(el => {
                    el.addEventListener('dragstart', (e) => {
                        const name = el.getAttribute('data-name');
                        const svg = el.querySelector('svg').outerHTML;
                        // Send icon SVG to VS Code extension
                        vscode.postMessage({ type: 'drag', name, svg });
                        e.dataTransfer.setData('text/plain', svg);
                    });
                    el.addEventListener('dblclick', () => {
                        vscode.postMessage({ type: 'save', name: el.getAttribute('data-name'), svg: el.querySelector('svg').outerHTML });
                    });
                });
            </script>
        </body>
        </html>
        `;

        // Listen for messages from Webview
        panel.webview.onDidReceiveMessage(msg => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) return;
            const iconsFolder = path.join(workspaceFolder, 'icons');
            if (!fs.existsSync(iconsFolder)) fs.mkdirSync(iconsFolder);

            if (msg.type === 'save') {
                const filePath = path.join(iconsFolder, `${msg.name}.svg`);
                fs.writeFileSync(filePath, msg.svg, 'utf-8');
                vscode.window.showInformationMessage(`Saved ${msg.name}.svg to ${iconsFolder}`);
            } else if (msg.type === 'drag') {
                // Optional: could integrate more drag-drop logic if needed
                console.log(`Dragged icon: ${msg.name}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('🔹 LobeHub Icon Helper Deactivated');
}
