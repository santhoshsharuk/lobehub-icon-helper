"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('🔹 LobeHub Icon Helper Activated');
    const disposable = vscode.commands.registerCommand('lobehubIcons.searchIcon', async () => {
        // Ask user for icon name
        const iconName = await vscode.window.showInputBox({
            prompt: 'Enter LobeHub Icon Name (e.g., "home")'
        });
        if (!iconName)
            return;
        const url = `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${iconName}.svg`;
        try {
            // Fetch icon
            const res = await fetch(url);
            if (!res.ok) {
                vscode.window.showErrorMessage(`Icon '${iconName}' does NOT exist.`);
                return;
            }
            const svgContent = await res.text();
            // Show preview in Webview
            const panel = vscode.window.createWebviewPanel('iconPreview', `Preview: ${iconName}`, vscode.ViewColumn.One, { enableScripts: true });
            panel.webview.html = `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;">
                ${svgContent}
                </body></html>`;
            // Ask user to save icon
            const save = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Save icon to workspace?' });
            if (save === 'Yes') {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('Open a workspace folder first');
                    return;
                }
                const iconsFolder = path.join(workspaceFolder, 'icons');
                if (!fs.existsSync(iconsFolder))
                    fs.mkdirSync(iconsFolder);
                const filePath = path.join(iconsFolder, `${iconName}.svg`);
                fs.writeFileSync(filePath, svgContent, 'utf-8');
                vscode.window.showInformationMessage(`Icon saved to ${filePath}`);
            }
        }
        catch (err) {
            vscode.window.showErrorMessage('Failed to fetch icon: ' + err);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    console.log('🔹 LobeHub Icon Helper Deactivated');
}
//# sourceMappingURL=extension.js.map