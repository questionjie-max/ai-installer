<div align="center">
  <h1>🔧 AI 工具安装助手</h1>
  <h3>AI 编程工具一键安装器</h3>
  <p>
    <em>自动检测环境 · 自动补齐依赖 · 一键安装<br>
    支持 Claude Code、Codex CLI、Cursor、DeepSeek TUI、Windsurf、Trae 等 14 款 AI 编程工具</em>
  </p>
  <p>
    <a href="README.md"><img src="https://img.shields.io/badge/English-Readme-blue?style=flat-square" alt="English"></a>
    <a href="https://github.com/questionjie-max/ai-installer/releases"><img src="https://img.shields.io/github/v/release/questionjie-max/ai-installer?style=flat-square" alt="下载"></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/questionjie-max/ai-installer?style=flat-square" alt="许可证"></a>
  </p>
  <p>
    <img src="docs/screenshots/ss-welcome.png" width="280" alt="欢迎页">
    <img src="docs/screenshots/ss-select.png" width="280" alt="选择产品">
    <img src="docs/screenshots/ss-detect.png" width="225" alt="环境检测">
    <img src="docs/screenshots/ss-install.png" width="225" alt="安装中">
  </p>
</div>

---

## 📖 简介

**AI 工具安装助手** 是一个桌面图形界面工具，帮助开发者快速配置 AI 编程环境。不用一个个去官网下载、不用敲一堆 `npm install` 命令、不用手动配 PATH——勾选你要的工具，点一下安装就行了。

### 为什么需要这个工具

安装 AI 编程工具（如 Claude Code、Cursor、DeepSeek TUI）通常需要：
1. 安装 Node.js（选版本、配 PATH）
2. 安装 Git
3. 跑 `npm install -g` 
4. 手动把命令链接到 PATH
5. 每个工具重复一遍

这个安装器把整个过程自动化了，从环境检测到安装一步到位，特别针对中国大陆用户做了镜像加速优化。

---

## ✨ 功能特点

| 功能 | 说明 |
|------|------|
| **🖥️ 桌面图形界面** | 不用敲命令行，点点鼠标就能装 |
| **🔍 自动环境检测** | 自动检查 Node.js、Git、Python 版本和网络状态 |
| **⚡ 智能镜像切换** | 海外源慢时自动切到淘宝 npmmirror.com 镜像，无需 VPN |
| **📦 一键安装** | 选多个工具 → 检测环境 → 一键安装，全流程自动化 |
| **🔗 装完直接用** | CLI 命令自动链接到 `~/.local/bin`，终端直接能用 |
| **🌐 跨平台** | 支持 macOS（Apple Silicon + Intel）和 Windows |

---

## 📦 支持的产品（14 款）

### 📟 终端 CLI / AI Agent
在终端里直接运行，适合自动化操作的 AI 编程工具。

| 产品 | 厂商 | 安装方式 | ⭐ |
|------|------|---------|:--:|
| [Claude Code](https://docs.anthropic.com/zh-CN/docs/claude-code/overview) | Anthropic | `npm i -g @anthropic-ai/claude-code` | — |
| [Codex CLI](https://github.com/openai/codex) | OpenAI | `npm i -g @openai/codex` | — |
| [OpenCode](https://github.com/sst/opencode) | SST / anomalyco | `npm i -g opencode-ai` | 163k |
| [DeepSeek TUI](https://github.com/Hmbown/DeepSeek-TUI) | Hunter Bown | `npm i -g deepseek-tui` | 33k |
| [Kimi Code](https://www.npmjs.com/package/kimi-code) | 月之暗面 | `npm i -g kimi-code` | — |
| [Qoder CLI](https://qoder.com) | 阿里云 | `npm i -g @qoder-ai/qodercli` | — |
| [OpenClaw](https://github.com/openclaw/openclaw) | 开源社区 | `npm i -g openclaw` | — |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | Nous Research | 安装脚本 | — |

### 🖥️ AI 编辑器
内置 AI 功能的桌面编辑器。

| 产品 | 厂商 | 支持平台 |
|------|------|---------|
| [Cursor](https://cursor.com) | Anysphere | macOS, Windows |
| [Windsurf](https://windsurf.com) | Codeium | macOS, Windows, Linux |
| [Trae](https://www.trae.com.cn) | 字节跳动 | macOS, Windows |
| [Qoder 桌面版](https://qoder.com) | 阿里云 | macOS, Windows, Linux |
| [VS Code](https://code.visualstudio.com) | 微软 | macOS, Windows, Linux |

### 🔄 管理工具
| 产品 | 厂商 | 说明 |
|------|------|------|
| [CC Switch](https://github.com/checherish56/cc-switch-app) | 开源社区 | AI 编程助手统一管理切换工具 |

---

## 🚀 快速开始

### 系统要求
- **macOS**: 12.0+（Apple Silicon 或 Intel）
- **Windows**: Windows 10+（x64）

### 下载
从 [Releases 页面](https://github.com/questionjie-max/ai-installer/releases) 下载最新版本。

### 或者从源码运行
```bash
git clone https://github.com/questionjie-max/ai-installer.git
cd ai-installer
npm install
npm start
```

### 使用流程
```
打开应用 → 勾选工具 → 检测环境 → 一键安装 → ✅ 完成
```

---

## 🌏 网络优化

**中国大陆用户**无需配置 VPN：

- 能直连海外 → 走官方源（`registry.npmjs.org`）
- 海外源慢或连不上 → 自动切到淘宝镜像（`npmmirror.com`）

### 离线安装
把安装包提前下载好放到 `cache/` 目录，安装器会优先使用本地缓存。

---

## 📄 开源协议

MIT

---

## 🤝 贡献

欢迎贡献！加新工具、改界面、修 Bug 都可以：

1. 先提 [Issue](https://github.com/questionjie-max/ai-installer/issues) 讨论
2. 提交 [Pull Request](https://github.com/questionjie-max/ai-installer/pulls)
3. 点个 ⭐ 让更多人看到

---

<div align="center">
  <sub>为不想折腾环境的开发者而生</sub>
  <br>
  <sub>❤️ 开源社区作品</sub>
</div>
