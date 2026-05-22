<div align="center">
  <h1>🔧 AI 工具安装助手</h1>
  <p><strong>一键安装主流 AI 编程工具，自动检测环境、补齐依赖，装完直接用。</strong></p>
  <p>
    <a href="README.md">English</a> ·
    <a href="https://github.com/questionjie-max/ai-installer/releases">下载</a> ·
    <a href="#-支持的产品">产品列表</a> ·
    <a href="#-快速开始">快速开始</a>
  </p>
  <p>
    <img src="docs/screenshots/welcome.png" width="320" alt="欢迎页">
    <img src="docs/screenshots/select-products.png" width="320" alt="选择产品">
    <img src="docs/screenshots/detect-result.png" width="320" alt="环境检测">
  </p>
</div>

---

## ✨ 功能特点

- **🖥️ 桌面图形界面** — 不用敲命令行，点点鼠标就能装
- **🔍 自动环境检测** — 自动检测 Node.js、Git、Python 和网络状态
- **⚡ 智能镜像切换** — 检测到海外源慢时自动切到国内淘宝镜像，无需 VPN
- **📦 一键安装** — 选工具 → 检测环境 → 安装，一气呵成
- **🔗 装完直接用** — 装完后命令自动链接到 `~/.local/bin`，终端直接就能用
- **🌐 跨平台** — 支持 macOS (dmg/zip) 和 Windows (exe)

---

## 📋 支持的产品

### 📟 终端 CLI（8款）
| 产品 | 厂商 | 安装方式 |
|------|------|---------|
| [Claude Code](https://docs.anthropic.com/zh-CN/docs/claude-code/overview) | Anthropic | `npm i -g @anthropic-ai/claude-code` |
| [Codex CLI](https://github.com/openai/codex) | OpenAI | `npm i -g @openai/codex` |
| [OpenCode](https://github.com/sst/opencode) | SST (anomalyco) | `npm i -g opencode-ai` |
| [DeepSeek TUI](https://github.com/Hmbown/DeepSeek-TUI) | Hunter Bown | `npm i -g deepseek-tui` |
| [Kimi Code](https://www.npmjs.com/package/kimi-code) | 月之暗面 | `npm i -g kimi-code` |
| [Qoder CLI](https://qoder.com) | 阿里云 | `npm i -g @qoder-ai/qodercli` |
| [OpenClaw](https://github.com/openclaw/openclaw) | 开源社区 | `npm i -g openclaw` |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | Nous Research | 安装脚本 |

### 🖥️ AI 编辑器（5款）
| 产品 | 厂商 | 安装方式 |
|------|------|---------|
| [Cursor](https://cursor.com) | Anysphere | 下载 DMG/EXE |
| [Windsurf](https://windsurf.com) | Codeium | 下载 DMG/EXE |
| [Trae](https://www.trae.com.cn) | 字节跳动 | 下载 DMG/EXE |
| [Qoder 桌面版](https://qoder.com) | 阿里云 | 下载 DMG/EXE |
| [VS Code](https://code.visualstudio.com) | 微软 | 下载 DMG/EXE |

### 🔄 管理工具（1款）
| 产品 | 厂商 | 说明 |
|------|------|------|
| [CC Switch](https://github.com/checherish56/cc-switch-app) | 开源社区 | AI 编程助手统一管理切换工具 |

---

## 🚀 快速开始

### 下载安装包
从 [Releases 页面](https://github.com/questionjie-max/ai-installer/releases) 下载最新版本。

对于中国大陆用户，如果下载慢可以通过网盘或 NAS 获取离线包。

### 从源码运行
```bash
git clone https://github.com/questionjie-max/ai-installer.git
cd ai-installer
npm install
npm start
```

### 使用流程
1. **打开应用** — 看到欢迎页
2. **选择工具** — 勾选你想装的 AI 工具
3. **检测环境** — 自动检测 Node.js、Git 是否已安装
4. **一键安装** — 点击"开始安装"，自动补齐缺失依赖并安装选中工具
5. **完成** — CLI 工具装完直接在终端使用

---

## 🖥️ 打包构建

```bash
# macOS
npm run build:mac

# Windows（macOS 上需要装 Wine）
npm run build:win
```

打包产物在 `dist/` 目录。

---

## 🧩 项目结构

```
ai-installer/
├── main.js              # Electron 主进程
├── preload.js           # 安全桥接
├── products.json        # 14 款产品配置
├── modules/
│   ├── products.js      # 产品配置加载
│   ├── detector.js      # 环境检测模块
│   └── installer.js     # 安装引擎
├── renderer/
│   ├── index.html       # UI 页面
│   ├── css/style.css    # 深色主题样式
│   └── js/app.js        # 前端逻辑
├── docs/                # 文档和截图
└── package.json
```

---

## 📄 开源协议

MIT

---

## 🤝 贡献

找到 Bug 了？想加新工具？欢迎提 [Issue](https://github.com/questionjie-max/ai-installer/issues) 或 PR！
