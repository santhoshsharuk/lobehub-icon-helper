import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getPremiumWebviewHtml(iconContents: { name: string; svg: string }[]): string {
    const galleryHtml = iconContents.map(icon => `
        <div class="icon-card" draggable="true" data-name="${icon.name}">
            <div class="icon-preview">
                ${icon.svg}
            </div>
            <div class="icon-info">
                <h3 class="icon-name">${icon.name}</h3>
                <button class="copy-btn" onclick="copyIcon('${icon.name}')">Copy SVG</button>
            </div>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LobeHub Icon Gallery</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
                background: linear-gradient(135deg, #0d0d14 0%, #1a0a1e 50%, #0f0518 100%);
                color: #ffffff;
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Navigation Bar */
            .nav-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: rgba(13, 13, 20, 0.8);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 1rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #ff6b9d, #c44569, #9b59b6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .nav-menu {
                display: flex;
                gap: 2rem;
                list-style: none;
            }

            .nav-menu a {
                color: rgba(255, 255, 255, 0.7);
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                position: relative;
            }

            .nav-menu a:hover {
                color: #ff6b9d;
                transform: translateY(-2px);
            }

            .cta-button {
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }

            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(255, 107, 157, 0.3);
            }

            /* Hero Section */
            .hero {
                padding: 8rem 2rem 4rem;
                text-align: center;
                position: relative;
            }

            .hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 60%;
                height: 400px;
                background: radial-gradient(ellipse, rgba(255, 107, 157, 0.1) 0%, transparent 70%);
                filter: blur(100px);
                z-index: -1;
            }

            .hero-title {
                font-size: clamp(3rem, 8vw, 6rem);
                font-weight: 900;
                margin-bottom: 1.5rem;
                background: linear-gradient(135deg, #ffffff, #ff6b9d, #c44569, #9b59b6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                line-height: 1.1;
                letter-spacing: -0.02em;
            }

            .hero-subtitle {
                font-size: 1.25rem;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 2rem;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.6;
            }

            .stats-container {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 3rem;
                flex-wrap: wrap;
            }

            .stat-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 1.5rem 2rem;
                text-align: center;
                transition: all 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-5px);
                border-color: rgba(255, 107, 157, 0.3);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: #ff6b9d;
                display: block;
            }

            .stat-label {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.9rem;
                margin-top: 0.5rem;
            }

            /* Gallery Section */
            .gallery-section {
                padding: 4rem 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }

            .section-title {
                font-size: 2.5rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 3rem;
                background: linear-gradient(135deg, #ffffff, #ff6b9d);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }

            .icon-card {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 2rem;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: grab;
                position: relative;
                overflow: hidden;
            }

            .icon-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 107, 157, 0.1), transparent);
                transition: left 0.5s ease;
            }

            .icon-card:hover::before {
                left: 100%;
            }

            .icon-card:hover {
                transform: translateY(-10px) scale(1.02);
                border-color: rgba(255, 107, 157, 0.3);
                box-shadow: 
                    0 25px 50px rgba(0, 0, 0, 0.5),
                    0 0 30px rgba(255, 107, 157, 0.1);
            }

            .icon-card:active {
                cursor: grabbing;
                transform: translateY(-5px) scale(0.98);
            }

            .icon-preview {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 120px;
                margin-bottom: 1.5rem;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.02);
                position: relative;
            }

            .icon-preview svg {
                width: 64px;
                height: 64px;
                color: #ff6b9d;
                filter: drop-shadow(0 4px 20px rgba(255, 107, 157, 0.3));
                transition: all 0.3s ease;
            }

            .icon-card:hover .icon-preview svg {
                transform: scale(1.1);
                filter: drop-shadow(0 8px 30px rgba(255, 107, 157, 0.5));
            }

            .icon-info {
                text-align: center;
            }

            .icon-name {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: rgba(255, 255, 255, 0.9);
                text-transform: capitalize;
            }

            .copy-btn {
                background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(196, 69, 105, 0.2));
                border: 1px solid rgba(255, 107, 157, 0.3);
                color: #ff6b9d;
                padding: 0.75rem 1.5rem;
                border-radius: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                width: 100%;
            }

            .copy-btn:hover {
                background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(196, 69, 105, 0.3));
                border-color: rgba(255, 107, 157, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 107, 157, 0.2);
            }

            .copy-btn:active {
                transform: translateY(0);
            }

            /* Instructions Section */
            .instructions {
                padding: 4rem 2rem;
                background: rgba(255, 255, 255, 0.02);
                margin: 4rem 0;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .instructions-content {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }

            .instructions h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #ff6b9d;
            }

            .instructions p {
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.6;
                margin-bottom: 1rem;
            }

            .usage-steps {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-top: 2rem;
            }

            .step {
                background: rgba(255, 255, 255, 0.05);
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .step-number {
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                margin: 0 auto 1rem;
            }

            .step h4 {
                margin-bottom: 0.5rem;
                color: white;
            }

            .step p {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Footer */
            .footer {
                padding: 2rem;
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
            }

            .footer p {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.9rem;
            }

            .footer a {
                color: #ff6b9d;
                text-decoration: none;
            }

            .footer a:hover {
                text-decoration: underline;
            }

            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .icon-card {
                animation: fadeIn 0.6s ease forwards;
            }

            .icon-card:nth-child(even) {
                animation-delay: 0.1s;
            }

            .icon-card:nth-child(3n) {
                animation-delay: 0.2s;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .nav-bar {
                    padding: 1rem;
                    flex-direction: column;
                    gap: 1rem;
                }

                .nav-menu {
                    gap: 1rem;
                }

                .hero {
                    padding: 6rem 1rem 3rem;
                }

                .stats-container {
                    gap: 1rem;
                }

                .stat-card {
                    padding: 1rem 1.5rem;
                }

                .gallery-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .usage-steps {
                    grid-template-columns: 1fr;
                }
            }

            /* Scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
            }

            ::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #c44569, #9b59b6);
            }
        </style>
    </head>
    <body>
        <!-- Navigation Bar -->
        <nav class="nav-bar">
            <div class="logo">LobeHub Icons</div>
            <ul class="nav-menu">
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#usage">Usage</a></li>
                <li><a href="https://github.com/lobehub/lobe-icons" target="_blank">GitHub</a></li>
            </ul>
            <a href="#" class="cta-button">Install Extension</a>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <h1 class="hero-title">LobeHub Icons</h1>
            <p class="hero-subtitle">
                Beautiful, consistent icons for your VS Code projects. 
                Search, preview, and insert premium icons without leaving your editor.
            </p>
            
            <div class="stats-container">
                <div class="stat-card">
                    <span class="stat-number">${iconContents.length}</span>
                    <span class="stat-label">Icons Found</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">1000+</span>
                    <span class="stat-label">Total Icons</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">SVG</span>
                    <span class="stat-label">Format</span>
                </div>
            </div>
        </section>

        <!-- Gallery Section -->
        <section class="gallery-section" id="gallery">
            <h2 class="section-title">Icon Gallery</h2>
            <div class="gallery-grid">
                ${galleryHtml}
            </div>
        </section>

        <!-- Instructions Section -->
        <section class="instructions" id="usage">
            <div class="instructions-content">
                <h3>How to Use</h3>
                <p>Get started with LobeHub icons in just a few simple steps</p>
                
                <div class="usage-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <h4>Search Icons</h4>
                        <p>Use Cmd+Shift+P and search for "Search LobeHub Icon"</p>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <h4>Preview Icons</h4>
                        <p>Browse through beautiful icon previews in this gallery</p>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <h4>Copy or Save</h4>
                        <p>Double-click to save or click Copy to get the SVG code</p>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <h4>Use in Project</h4>
                        <p>Paste the SVG code directly into your project files</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>Made with ❤️ for VS Code • <a href="https://github.com/lobehub/lobe-icons" target="_blank">LobeHub Icons</a></p>
        </footer>

        <script>
            const vscode = acquireVsCodeApi();
            
            // Copy functionality
            function copyIcon(iconName) {
                const iconCard = document.querySelector(\`[data-name="\${iconName}"]\`);
                const svg = iconCard.querySelector('svg').outerHTML;
                
                // Copy to clipboard via VS Code API
                vscode.postMessage({ 
                    type: 'copy', 
                    name: iconName, 
                    svg: svg 
                });
                
                // Visual feedback
                const button = iconCard.querySelector('.copy-btn');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.background = 'linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.3))';
                button.style.borderColor = 'rgba(46, 204, 113, 0.5)';
                button.style.color = '#2ecc71';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    button.style.borderColor = '';
                    button.style.color = '';
                }, 2000);
            }

            // Drag and drop functionality
            document.querySelectorAll('.icon-card').forEach(el => {
                el.addEventListener('dragstart', (e) => {
                    const name = el.getAttribute('data-name');
                    const svg = el.querySelector('svg').outerHTML;
                    vscode.postMessage({ type: 'drag', name, svg });
                    e.dataTransfer.setData('text/plain', svg);
                });
                
                el.addEventListener('dblclick', () => {
                    const name = el.getAttribute('data-name');
                    const svg = el.querySelector('svg').outerHTML;
                    vscode.postMessage({ 
                        type: 'save', 
                        name: name, 
                        svg: svg 
                    });
                });
            });

            // Smooth scrolling for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Add scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.icon-card, .stat-card, .step').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        </script>
    </body>
    </html>
    `;
}

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

        panel.webview.html = getPremiumWebviewHtml(iconContents);

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
            } else if (msg.type === 'copy') {
                vscode.env.clipboard.writeText(msg.svg);
                vscode.window.showInformationMessage(`Copied ${msg.name} SVG to clipboard`);
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
