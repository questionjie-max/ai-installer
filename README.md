<div align="center">
  <h1>🔧 AI Tool Installer</h1>
  <p><strong>One-click installation for mainstream AI coding tools — auto-detect environment, auto-install dependencies.</strong></p>
  <p>
    <a href="README.zh.md">中文</a> ·
    <a href="https://github.com/questionjie-max/ai-installer/releases">Download</a> ·
    <a href="#-supported-products">Products</a> ·
    <a href="#-quick-start">Quick Start</a>
  </p>
  <p>
    <img src="docs/screenshots/welcome.png" width="320" alt="Welcome">
    <img src="docs/screenshots/select-products.png" width="320" alt="Select Products">
    <img src="docs/screenshots/detect-result.png" width="320" alt="Environment Detection">
  </p>
</div>

---

## ✨ Features

- **🖥️ GUI Desktop App** — No terminal commands needed, simple point-and-click
- **🔍 Auto Environment Detection** — Automatically checks Node.js, Git, Python, and network status
- **⚡ Smart Mirror Switching** — Detects network conditions and auto-switches to Chinese mirrors for faster downloads
- **📦 One-Click Install** — Select tools → detect environment → install, all in one flow
- **🔗 PATH Auto-Link** — After installation, CLI commands are automatically linked to `~/.local/bin` so they work immediately in terminal
- **🌐 Multi-Platform** — macOS (dmg/zip), Windows (exe) support

---

## 📋 Supported Products

### CLI / Terminal Agents (8)
| Product | Vendor | Install Method |
|---------|--------|---------------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | Anthropic | `npm i -g @anthropic-ai/claude-code` |
| [Codex CLI](https://github.com/openai/codex) | OpenAI | `npm i -g @openai/codex` |
| [OpenCode](https://github.com/sst/opencode) | SST (anomalyco) | `npm i -g opencode-ai` |
| [DeepSeek TUI](https://github.com/Hmbown/DeepSeek-TUI) | Hunter Bown | `npm i -g deepseek-tui` |
| [Kimi Code](https://www.npmjs.com/package/kimi-code) | Moonshot AI | `npm i -g kimi-code` |
| [Qoder CLI](https://qoder.com) | Alibaba Cloud | `npm i -g @qoder-ai/qodercli` |
| [OpenClaw](https://github.com/openclaw/openclaw) | Open Source | `npm i -g openclaw` |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | Nous Research | Install script |

### AI Code Editors (5)
| Product | Vendor | Install Method |
|---------|--------|---------------|
| [Cursor](https://cursor.com) | Anysphere | Download DMG/EXE |
| [Windsurf](https://windsurf.com) | Codeium | Download DMG/EXE |
| [Trae](https://www.trae.com.cn) | ByteDance | Download DMG/EXE |
| [Qoder Desktop](https://qoder.com) | Alibaba Cloud | Download DMG/EXE |
| [VS Code](https://code.visualstudio.com) | Microsoft | Download DMG/EXE |

### Management Tools (1)
| Product | Vendor | Description |
|---------|--------|-------------|
| [CC Switch](https://github.com/checherish56/cc-switch-app) | Open Source | Unified manager for AI coding assistants |

---

## 🚀 Quick Start

### Download
Download the latest release from the [Releases page](https://github.com/questionjie-max/ai-installer/releases).

### Or build from source
```bash
git clone https://github.com/questionjie-max/ai-installer.git
cd ai-installer
npm install
npm start
```

### Usage
1. **Open the app** — you'll see the welcome screen
2. **Select tools** — check the AI tools you want to install
3. **Detect environment** — the app checks Node.js, Git, and network
4. **Install** — click "Start Install" and let it run
5. **Done!** — CLI tools work immediately in terminal

---

## 🖥️ Build from Source

```bash
# macOS
npm run build:mac

# Windows (requires Wine on macOS)
npm run build:win
```

Build output is in the `dist/` directory.

---

## 🧩 Architecture

```
ai-installer/
├── main.js              # Electron main process (window + IPC)
├── preload.js           # Secure bridge (renderer ↔ main)
├── products.json        # 14 products configuration
├── modules/
│   ├── products.js      # Product config loader
│   ├── detector.js      # Environment detection (Node/Git/Network)
│   └── installer.js     # Installation engine (npm/download/script)
├── renderer/
│   ├── index.html       # UI pages
│   ├── css/style.css    # Dark theme styles
│   └── js/app.js        # Frontend logic
├── docs/                # Documentation & screenshots
└── package.json
```

---

## 📄 License

MIT

---

## 🤝 Contributing

Found a bug? Want to add a new tool? Open an [issue](https://github.com/questionjie-max/ai-installer/issues) or submit a PR!
