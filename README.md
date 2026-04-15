# Design.md Extractor

一个 Chrome 扩展，可以从任意网页提取设计系统规范，使用 Gemini AI 生成 Stitch 格式的 DESIGN.md 文件。

## 功能特点

- 从任意网页提取设计系统
- 分析颜色、字体、CSS 变量
- 生成 Stitch 格式的 DESIGN.md
- API Key 本地存储
- 历史记录功能

## 安装步骤

### 1. 构建扩展

```bash
npm install
npm run build
```

### 2. 加载到 Chrome

1. 打开 Chrome，进入 `chrome://extensions/`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择项目中的 `dist` 文件夹

### 3. 配置 API Key

1. 点击 Chrome 工具栏中的扩展图标
2. 点击 **Settings** 进入设置
3. 输入你的 Gemini API Key
   - 免费获取：https://aistudio.google.com/apikey
4. 点击 **Save** 保存

## 使用方法

1. 打开你想提取设计的网页
2. 点击扩展图标
3. 点击 **Extract DESIGN.md** 按钮
4. 等待 AI 分析完成
5. 复制或下载生成的 DESIGN.md

## 如何工作

1. **内容脚本** - 提取页面样式（颜色、字体、CSS 变量）
2. **后台脚本** - 处理消息通信
3. **Gemini AI** - 分析提取的数据
4. **生成文档** - 输出 Stitch 格式的 DESIGN.md

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (状态管理)
- Gemini API

## 隐私说明

你的 API Key 仅存储在浏览器本地存储中 (`chrome.storage.local`)，不会发送到任何第三方服务器，只会直接发送到 Google 的 Gemini API。

## 在线示例

访问 [getdesign.md](https://designmd.542186947.workers.dev/) 查看 66+ 设计系统示例。

## License

MIT
