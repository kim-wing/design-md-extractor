# Design.md Extractor

> Open any webpage → AI extracts its design system → get an enhanced DESIGN.md you can reuse for consistent AI-generated UI.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)

**[中文](#中文说明) | [English](#english-guide)**

---

## 中文说明

### 这是什么

Design.md Extractor 是一个 Chrome 扩展。打开任意网页，点击提取按钮，AI 自动分析页面设计系统（颜色、字体、间距、组件样式……），输出一份增强版 `DESIGN.md` 文件。这个版本更适合后续继续喂给 AI 生成 UI，而不只是做设计说明。

### 功能亮点

- 🎨 **增强版 DESIGN.md 输出** — 更适合 AI 连续生成 UI 的设计协议
- 🌐 **提取完整设计要素** — 颜色、字体、字号层级、CSS 变量、组件、导航、媒体和动效样式
- ⚡ **一键复制/下载** — 生成后可直接复制或下载 markdown 文件
- 🔒 **隐私优先** — API Key 仅存储在本地，不经过任何第三方服务器
- 📜 **历史记录管理** — 自动保存最近提取的设计，支持单条删除和全部清空
- 🛠 **提取更稳** — 内容脚本丢失时会自动重试注入，减少 “Receiving end does not exist” 报错

### 升级说明

#### v1.2.0 - 2026-04-29

- 借鉴 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 的扩展结构，输出更完整的 `DESIGN.md`：视觉氛围、颜色角色、字体规则、组件样式、布局原则、深度层级、响应式行为、Agent Prompt Guide 和 Prompt Contract。
- 提取器新增字号层级、导航样式、图片/媒体处理、过渡动效等证据，减少 AI 生成时的风格漂移。
- 下载包已更新为 `extension.zip`，并提供版本包 `extension-v1.2.0.zip`。

升级已安装的解压版扩展时，下载新版 `extension.zip` 并解压覆盖原目录，然后在 `chrome://extensions/` 中点击扩展卡片上的刷新按钮。

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
# 构建完成后，加载 dist/ 文件夹
```

#### 导入 Chrome

1. 打开 Chrome，地址栏输入 `chrome://extensions/` 并回车
2. 右上角开启 **开发者模式**
3. 点击左上角 **加载已解压的扩展程序**
4. 选择解压后的文件夹，或源码构建后的 `dist/` 文件夹
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
5. 复制、下载，或在历史记录中恢复之前生成的 DESIGN.md

### 输出特点

当前版本默认生成增强版 `DESIGN.md`，会尽量包含这些结构化信息：

- `semanticRoles`
- `effects`
- `constraints`
- `responsiveRules`
- `components`
- `Prompt Contract`

相比传统“设计说明文”，这个版本更适合：

- 反复生成多个页面时保持同一套设计语言
- 作为后续 AI UI 生成的底层约束
- 做 diff、lint 和设计回归检查

### 生成示例

```markdown

# Design System - Apple Store 在线商店

## 1. Visual Theme & Atmosphere
The design philosophy is rooted in Apple’s "Human Interface Guidelines," emphasizing clarity, deference, and depth. The mood is premium, minimalist, and highly structured. It utilizes a high-density of white space to focus attention on high-quality product imagery. The interface feels "airy" yet precise, with a sophisticated balance between light gray backgrounds and crisp typography.

## 2. Color Palette & Roles
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Jet Black | #1d1d1f | Primary text, headings, and core UI elements |
| Pure Black | #000000 | Deepest contrast, footer backgrounds, or specific product text |
| Pure White | #ffffff | Primary background for product sections and cards |
| Off White | #fafafc | Subtle background differentiation for secondary sections |
| System Gray | #f5f5f7 | Large section backgrounds and container fills |
| Secondary Text | #6e6e73 | Subtitles, captions, and less emphasized information |
| Tertiary Text | #86868b | Placeholder text, legal disclaimers, and breadcrumbs |
| Link Blue | #0066cc | Hyperlinks and interactive text elements |
| System Blue | #007aff | Primary call-to-action buttons and active states |
| Border Gray | #cccccc | Subtle dividers and input borders |
| Accent Purple | #ac39ff | Promotional highlights or specific product category accents |
| Success Green | #008009 | Availability status and positive confirmations |
| Loading Pink | #f78fb6 | Specific loading state indicators (CSS Variable) |

## 3. Typography Rules
- **Primary Font**: SF Pro SC, SF Pro Display, SF Pro Text
- **Fallback**: PingFang SC (for Chinese characters), Helvetica Neue, Arial, sans-serif
- **Scale**:
    - **H1 (Hero)**: 48px - 56px / Bold (Tracking: -0.009em)
    - **H2 (Section)**: 40px / Semibold
    - **H3 (Subhead)**: 28px - 32px / Semibold
    - **Body (Large)**: 19px - 21px / Regular
    - **Body (Standard)**: 17px / Regular
    - **Caption**: 12px - 14px / Medium

## 4. Component Stylings
### Buttons
- **Primary**: Pill-shaped (rounded-full), background #007aff, text #ffffff. Hover state involves a slight darkening or opacity shift.
- **Secondary/Ghost**: Pill-shaped, transparent background with #0066cc border or simple blue text with a chevron icon.
- **Size**: Standard height is 36px for small, 44px for medium/large.

### Cards
- **Product Cards**: Soft rounded corners (approx. 18px - 22px). Background is usually #ffffff or #f5f5f7.
- **Shadows**: Very subtle low-blur shadows or no shadow at all, relying on background color shifts to define boundaries.
- **Hover**: Subtle scale-up effect (1.02x) or increased shadow depth to indicate interactivity.

### Inputs
- **Text Fields**: 12px border-radius, #cccccc border, 17px font size for readability.
- **Focus State**: 2px blue ring or darkened border with high contrast.

## 5. Layout Principles
- **Grid**: 12-column fluid grid for desktop, 4-column for mobile.
- **Spacing Scale**: Increments of 8px (8, 16, 24, 32, 40, 48, 64, 80, 120).
- **Max Width**: Standard content container is 980px or 1200px depending on the viewport width.
- **Gutter**: 20px on mobile, 30px+ on desktop.

## 6. Depth & Elevation
- **Z-Index Layers**: 
    - Navigation: 9999 (Sticky)
    - Modals/Overlays: 10000
    - Content: 1-100
- **Dividers**: 1px solid #d2d2d7, used sparingly to separate major logical sections.
- **Blur**: Extensive use of `backdrop-filter: blur(20px)` on navigation bars to maintain context while scrolling.

## 7. Do's and Don'ts
### Do's
- Use high-resolution, transparent PNGs for product shots.
- Maintain generous padding around text blocks to ensure legibility.
- Use "SF Pro SC" for a consistent brand voice across Chinese and English text.
- Align text to the center for hero sections and left for informational grids.

### Don'ts
- Do not use harsh drop shadows or heavy gradients.
- Avoid using more than two different font weights in a single component.
- Do not use pure red for errors; use a refined #e30000 or similar brand-safe warning tones.
- Avoid cluttering the interface with too many competing calls-to-action.

## 8. Responsive Behavior
- **Desktop (>1068px)**: Full 12-column layout, horizontal scrolling for product carousels.
- **Tablet (734px - 1068px)**: Reduced margins, font sizes scale down slightly, grid collapses to 2-3 columns for cards.
- **Mobile (<734px)**: Single column layout, navigation transforms into a hamburger menu, touch targets increased to minimum 44x44px. Horizontal carousels allow for "peek" of the next card to indicate scrollability.
```

---

## English Guide

### What It Does

Design.md Extractor is a Chrome extension. Open any webpage, click extract, and AI automatically analyzes the page's design system (colors, fonts, spacing, component styles…) and outputs an enhanced `DESIGN.md` file. This version is meant to work as a reusable design contract for downstream AI UI generation, not just a visual summary.

### Features

- 🎨 **Enhanced DESIGN.md output** — Better suited for repeated AI UI generation
- 🌐 **Complete design extraction** — Colors, fonts, type scale, CSS variables, components, navigation, media, and motion styles
- ⚡ **One-click copy/download** — Copy or download markdown after generation
- 🔒 **Privacy-first** — API keys stored locally, never sent to third-party servers
- 📜 **History management** — Auto-saves recent extractions with single-delete and clear-all
- 🛠 **More reliable extraction** — Automatically retries content script injection when the page connection is missing

### Upgrade Notes

#### v1.2.0 - 2026-04-29

- Uses the extended structure inspired by [awesome-design-md](https://github.com/VoltAgent/awesome-design-md): visual theme, color roles, typography rules, component stylings, layout principles, depth, responsive behavior, Agent Prompt Guide, and Prompt Contract.
- Extracts richer evidence from pages, including typography scale, navigation, image/media treatment, and motion styles.
- The download package has been refreshed as `extension.zip`, with a versioned `extension-v1.2.0.zip` package for releases.

To upgrade an unpacked install, download the new `extension.zip`, unzip it over the previous folder, then reload the extension from `chrome://extensions/`.

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
# Load the dist/ folder after build
```

#### Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle on **Developer mode** (top-right corner)
3. Click **Load unpacked** (top-left)
4. Select the unzipped folder, or the `dist/` folder from source build
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
5. Copy or download the generated DESIGN.md, or restore older results from history

### Output Shape

The current version aims to generate an enhanced `DESIGN.md` with structured sections such as:

- `semanticRoles`
- `effects`
- `constraints`
- `responsiveRules`
- `components`
- `Agent Prompt Guide`
- `Prompt Contract`

This makes the file more useful for:

- generating multiple screens with less design drift
- feeding a stronger design contract into other AI tools
- running lint, diff, and regression checks later

---

## 技术栈 | Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** · **Zustand**
- Chrome Extension Manifest V3
- **Gemini API** for enhanced DESIGN.md generation

---

## 🙏 致谢 | Acknowledgment

本项目灵感来源于 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)，一个收集了 66+ 优秀设计系统 DESIGN.md 的项目。

This project was inspired by [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), a collection of 66+ excellent design system DESIGN.md files.

---

## License

MIT
