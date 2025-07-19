<!--
 * @Author: ZYXin
 * @Date: 2025-07-19 14:19:02
 * @LastEditTime: 2025-07-19 14:25:27
 * @FilePath: /home/README.md
-->
<div align="center">

# 🏠 ZYXin の主页

*一个简洁美观的个人主页，基于 Vue 3 + Vite 构建*

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/github/license/zyxinab/home?style=flat-square)](./LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()

[🌐 在线预览](https://333666.best) · [📖 使用文档](#使用说明) · [🐛 问题反馈](https://github.com/zyxinab/home/issues)

</div>

## ✨ 特色功能

- 🎨 **现代化设计** - 简洁美观的界面设计，支持响应式布局
- 🌈 **载入动画** - 精美的页面载入动画效果
- 🎵 **音乐播放器** - 支持网易云音乐、QQ音乐等平台
- 🌤️ **实时天气** - 基于地理位置的天气信息显示
- 📱 **移动端适配** - 完美适配移动设备
- 🌍 **国际化支持** - 智能识别海外访客，显示欢迎信息
- ⚡ **性能优化** - PWA 支持，离线可用
- 🔧 **高度可定制** - 通过配置文件轻松个性化

## 🚀 快速开始

### 📋 环境要求

- Node.js >= 16.16.0
- npm >= 8.15.0 或 pnpm >= 7.0.0

### 🛠️ 本地开发

```bash
# 克隆项目
git clone https://github.com/zyxinab/home.git
cd home

# 安装 pnpm（推荐）
npm install -g pnpm

# 安装依赖
pnpm install

# 复制环境变量文件
cp .env.example .env

# 修改 .env 文件中的配置（重要！）
# 详见下方配置说明

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 🌐 部署方式

#### Vercel 一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zyxinab/home)

1. 点击上方按钮一键部署到 Vercel
2. Fork 本仓库到你的 GitHub 账号
3. 在 Vercel 中导入你的仓库
4. 添加环境变量（参考 `.env.example`）
5. 点击部署即可

#### Netlify 部署

1. Fork 本仓库
2. 在 Netlify 中导入仓库
3. 构建命令：`pnpm build`
4. 发布目录：`dist`

#### 传统服务器部署

```bash
# 构建项目
pnpm build

# 将 dist 目录上传到服务器
scp -r dist/* user@server:/var/www/html/
```

#### Docker 部署

```bash
# 构建镜像
docker build -t home .

# 运行容器
docker run -p 3000:3000 -d home
```

## ⚙️ 配置说明

### 📝 环境变量配置

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
# 站点基本信息
VITE_SITE_NAME="Your Site Name"           # 站点名称
VITE_SITE_AUTHOR="Your Name"              # 作者名称
VITE_SITE_URL="https://yoursite.com"      # 站点地址

# 天气服务（可选）
VITE_WEATHER_KEY=""                       # 高德地图 API Key

# 音乐播放器（可选）
VITE_SONG_API="https://api.i-meto.com/meting/api"
VITE_SONG_SERVER="netease"                # 音乐平台
VITE_SONG_TYPE="playlist"                 # 播放类型
VITE_SONG_ID=""                          # 播放列表 ID
```

### 🎵 音乐配置

1. **获取播放列表 ID**：
   - 网易云音乐：打开歌单页面，URL 中的数字就是 ID
   - QQ 音乐：同样在歌单页面 URL 中获取

2. **推荐的 Meting API 服务**：
   - `https://api.i-meto.com/meting/api`（主要推荐）
   - `https://api.wuenci.com/meting/api/`（备用）

### 🌤️ 天气配置

1. 前往 [高德开放平台](https://console.amap.com/dev/key/app)
2. 创建 **Web 服务** 类型的 Key（注意不是 Web 端 JS API）
3. 将 Key 填入 `.env` 文件的 `VITE_WEATHER_KEY`
4. 如不配置，将自动使用备用天气 API

### 🔗 链接配置

#### 社交链接

编辑 `src/assets/socialLinks.json`：

```json
[
  {
    "name": "GitHub",
    "link": "https://github.com/yourusername",
    "icon": "github"
  }
]
```

#### 网站链接

编辑 `src/assets/siteLinks.json`：

```json
[
  {
    "name": "我的博客",
    "link": "https://blog.yoursite.com",
    "icon": "Blog"
  }
]
```

图标可从 [xicons.org](https://www.xicons.org) 选择并在 `src/components/Links.vue` 中引入。

## 🎨 个性化定制

### 🖼️ 更换背景图片

将图片放入 `public/images/` 目录，命名为 `background1.jpg` 到 `background10.jpg`。

### 🎨 修改主题色

编辑 `src/style/global.scss` 文件中的 CSS 变量。

### 📝 修改内容

- **一言内容**：项目自动从 [Hitokoto](https://hitokoto.cn/) 获取
- **显示文本**：在 `.env` 文件中修改 `VITE_DESC_*` 变量

## 🛠️ 技术栈

- **前端框架**：[Vue 3](https://vuejs.org/)
- **构建工具**：[Vite](https://vitejs.dev/)
- **状态管理**：[Pinia](https://pinia.vuejs.org/)
- **UI 组件**：[Element Plus](https://element-plus.org/)
- **图标库**：[IconPark](https://iconpark.oceanengine.com/) + [xicons](https://xicons.org/)
- **音乐播放**：[APlayer](https://aplayer.js.org/)
- **PWA 支持**：[Vite PWA](https://vite-pwa-org.netlify.app/)

## 📡 API 服务

- **天气服务**：[高德开放平台](https://lbs.amap.com/) / [教书先生 API](https://api.oioweb.cn/)
- **一言服务**：[Hitokoto](https://hitokoto.cn/)
- **音乐服务**：基于 Meting API
- **地理位置**：ip-api.com / ipapi.co

## 🌍 国际化特性

项目支持智能地理位置识别：

- **中国大陆用户**：显示天气信息和城市名称
- **海外用户**：显示友好的欢迎信息（如"欢迎来自美国的朋友"）
- **特殊地区**：专门处理中国台湾、香港、澳门地区

## 📱 PWA 支持

本项目支持 PWA（Progressive Web App）：

- 📱 可安装到桌面/主屏幕
- 🔄 自动更新
- 📦 离线缓存
- ⚡ 快速加载

## 🔧 开发指南

### 📁 项目结构

```
home/
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   └── font/              # 字体文件
├── src/
│   ├── assets/            # 配置文件
│   ├── components/        # Vue 组件
│   ├── store/             # Pinia 状态管理
│   ├── style/             # 样式文件
│   ├── utils/             # 工具函数
│   └── views/             # 页面组件
├── .env.example           # 环境变量模板
└── vite.config.js         # Vite 配置
```

### 🐛 常见问题

**Q: 音乐播放器无法播放？**
A: 请检查 Meting API 是否可用，可尝试更换其他 API 服务。

**Q: 天气信息显示失败？**
A: 请检查高德 API Key 是否正确配置，确认是 Web 服务类型的 Key。

**Q: 部署后页面空白？**
A: 请检查 `.env` 文件是否正确配置，确认所有必要的环境变量都已设置。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

- 感谢 [imsyy](https://github.com/imsyy) 的原始项目灵感
- 感谢所有开源项目的贡献者
- 感谢所有使用和支持本项目的用户

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

Made with ❤️ by [ZYXin](https://github.com/zyxinab)

</div>
