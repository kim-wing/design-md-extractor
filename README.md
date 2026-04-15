# Design.md Extractor

> Open any webpage → AI extracts its design system → get a Stitch-format DESIGN.md you can use to build consistent UI.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)

**[中文](#中文说明) | [English](#english-guide)**

---

## 中文说明

### 这是什么

Design.md Extractor 是一个 Chrome 扩展。打开任意网页，点击提取按钮，AI 自动分析页面设计系统（颜色、字体、间距、组件样式……），输出一份 Stitch 格式的 DESIGN.md 文件，你可以用它来构建风格一致的新 UI。

### 功能亮点

- 🎨 **Stitch 格式输出** — 标准化的设计系统文档格式
- 🌐 **提取完整设计要素** — 颜色、字体、CSS 变量、组件样式
- ⚡ **一键复制/下载** — 生成后可直接复制或下载 markdown 文件
- 🔒 **隐私优先** — API Key 仅存储在本地，不经过任何第三方服务器
- 📜 **历史记录** — 自动保存最近提取的设计

### 安装方法

#### 方法一：从 Release 下载（推荐，无需编译）

1. 前往 [Releases 页面](https://github.com/kim-wing/design-md-extractor/releases)
2. 下载最新版本的 `extension.zip`
3. 解压到任意文件夹

#### 方法二：从源码构建

```bash
git clone https://github.com/kim-wing/design-md-extractor.git
cd design-md-extractor
npm install
npm run build
# 构建完成后，使用 dist/ 文件夹
```

#### 导入 Chrome

1. 打开 Chrome，地址栏输入 `chrome://extensions/` 并回车
2. 右上角开启 **开发者模式**
3. 点击左上角 **加载已解压的扩展程序**
4. 选择解压后的文件夹（或 `dist/` 文件夹）
5. 扩展图标出现在工具栏，安装完成 ✅

### 配置 API Key

1. 点击工具栏的扩展图标
2. 点击 **Settings**
3. 填入你的 **Gemini API Key**（免费申请：[aistudio.google.com](https://aistudio.google.com/apikey)）
4. 点击 **Save** 保存

### 使用方法

1. 打开任意你想提取设计的网页
2. 点击扩展图标
3. 点击 **Extract DESIGN.md** 按钮
4. 等待几秒，AI 分析完成
5. 复制或下载生成的 DESIGN.md

### 生成示例

```markdown
# Design System - Vercel

## 1. Visual Theme & Atmosphere
Minimal, precise, black and white aesthetic...

## 2. Color Palette & Roles
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Black | #000000 | Primary background |
| White | #FFFFFF | Text and borders |

## 3. Typography Rules
- **Primary Font**: Inter
- **Fallback**: system-ui, sans-serif
- **Scale**: h1: 48px, h2: 36px...

## 4. Component Stylings
### Buttons
Minimal, no border-radius, high contrast...

## 5. Layout Principles
- **Grid**: 12-column, 1440px max-width
- **Spacing Scale**: 4px base unit...
```

---

## English Guide

### What It Does

Design.md Extractor is a Chrome extension. Open any webpage, click extract, and AI automatically analyzes the page's design system (colors, fonts, spacing, component styles…) and outputs a Stitch-format DESIGN.md file you can use to build consistent new UI.

### Features

- 🎨 **Stitch format output** — Standardized design system documentation
- 🌐 **Complete design extraction** — Colors, fonts, CSS variables, component styles
- ⚡ **One-click copy/download** — Copy or download markdown after generation
- 🔒 **Privacy-first** — API keys stored locally, never sent to third-party servers
- 📜 **History** — Auto-saves recent extractions

### Installation

#### Option 1: Download Release (Recommended — no build required)

1. Go to the [Releases page](https://github.com/kim-wing/design-md-extractor/releases)
2. Download the latest `extension.zip`
3. Unzip to any folder

#### Option 2: Build from Source

```bash
git clone https://github.com/kim-wing/design-md-extractor.git
cd design-md-extractor
npm install
npm run build
# Use the dist/ folder after build
```

#### Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle on **Developer mode** (top-right corner)
3. Click **Load unpacked** (top-left)
4. Select the unzipped folder (or the `dist/` folder from source build)
5. The extension icon appears in your toolbar — done ✅

### Configure Your API Key

1. Click the extension icon in the toolbar
2. Click **Settings**
3. Enter your **Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com/apikey))
4. Click **Save**

### How to Use

1. Open any webpage you want to extract design from
2. Click the extension icon
3. Click **Extract DESIGN.md**
4. Wait a few seconds for AI analysis
5. Copy or download the generated DESIGN.md

---

## 技术栈 | Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** · **Zustand**
- Chrome Extension Manifest V3
- **Gemini API** (`gemini-3-flash-preview`)

---

## 🙏 致谢 | Acknowledgment

本项目灵感来源于 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)，一个收集了 66+ 优秀设计系统 DESIGN.md 的项目。

This project was inspired by [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), a collection of 66+ excellent design system DESIGN.md files.

---

## License

MIT
