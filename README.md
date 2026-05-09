# CoBlog

CoBlog 是一个基于 `Vue 3 + NestJS + MongoDB` 的全栈博客系统。项目同时提供前台内容站点与后台管理端，适合作为个人博客、作品集项目或全栈学习模板。

## 项目亮点

- 前台：文章列表、详情、分类、标签、归档、留言、关于页
- 后台：文章编辑、分类标签管理、留言审核、站点统计
- 编辑体验：`md-editor-v3` + 图片上传 + 草稿自动保存
- 认证方案：`JWT Access Token + httpOnly Refresh Token`
- AI 助手：支持文章优化、摘要生成、流式对话
- 工程结构：`pnpm workspace + turbo` 的 monorepo 组织

## 技术栈

### 前端（apps/client）

- 框架与语言：`Vue 3`、`TypeScript`
- 构建工具：`Vite`
- 路由：`Vue Router`
- UI 组件：`Element Plus`、`@element-plus/icons-vue`
- 原子化样式与样式体系：`UnoCSS`、`Sass`
- 状态与组合式工具：`VueUse`
- 网络请求：`Axios`
- 图表：`ECharts`
- Markdown 编辑与预览：`md-editor-v3`
- 动画与可视化：`GSAP`、`Three.js`
- 工具库：`uuid`、`ua-parser-js`、`jwt-decode`、`pinyin-pro`、`simplex-noise`
- 类型支持：`@types/three`、`@types/ua-parser-js`、`@types/node`

### 后端（apps/server）

- 框架：`NestJS`（`@nestjs/common`、`@nestjs/core`、`@nestjs/platform-express`）
- 数据层：`Mongoose`、`MongoDB`
- 鉴权与安全：`@nestjs/jwt`、`bcrypt`、`httpOnly Cookie`
- 参数校验与转换：`class-validator`、`class-transformer`
- 文件上传：`multer`
- 配置管理：`@nestjs/config`
- 响应式与实时：`rxjs`
- 基础设施：`cookie-parser`、`reflect-metadata`
- 开发与规范：`ESLint`、`Prettier`、`typescript-eslint`

### AI 能力

- 模型接口：`DeepSeek Chat Completions API`
- 使用场景：正文优化、摘要生成、流式对话助写

### 工程化与协作

- Monorepo：`pnpm workspace`
- 构建编排：`Turborepo`
- 包管理与运行环境：`pnpm`、`Node.js`
- CI/CD：`GitHub Actions`
- 部署编排：`Nginx`、`PM2`
- 代码规范：`ESLint`、`Prettier`

## 快速开始（新手友好）

### 1. 环境准备

- Node.js `>= 20`
- pnpm `>= 10`
- MongoDB（本地或远程）

### 2. 克隆与安装

```bash
git clone https://github.com/zsh260439/CoBlog.git
cd CoBlog
pnpm install
```

### 3. 配置环境变量

在仓库根目录创建 `.env.development.local`：

```env
VITE_API_BASE_URL=http://localhost:3000

PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/coblog
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret

DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-v4-flash
```

### 4. 启动项目

```bash
pnpm dev:server
pnpm dev:client
```

默认访问：

- 前台：`http://localhost:5173`
- 后端：`http://localhost:3000`

## 常用命令

```bash
pnpm dev            # turbo 并行启动工作区开发任务
pnpm dev:client     # 仅启动前端
pnpm dev:server     # 仅启动后端

pnpm build          # 构建全部包
pnpm build:client   # 构建前端
pnpm build:server   # 构建后端
```

## 目录结构

```text
.
├── apps/
│   ├── client/                # Vue 客户端
│   └── server/                # Nest 服务端
├── packages/
│   └── types/                 # 共享类型包
├── docs/                      # 项目文档
├── pnpm-workspace.yaml
└── turbo.json
```

## 功能预览（核心模块）

### 前台站点

- 首页视觉模块
- 文章阅读页（目录联动、上一篇/下一篇、相关推荐）
- 分类页、标签页、归档页
- 留言页

### 后台管理

- 登录鉴权
- 文章管理（新建/编辑/发布）
- 分类标签管理
- 留言审核与回复
- 访问统计看板

### AI 助写

- 正文优化
- 自动摘要
- 流式对话助手（边生成边显示）

## 开源协作

欢迎通过 `Issue` 或 `Pull Request` 参与改进：

- Bug 修复
- 功能增强
- 文档完善
- 性能优化

如果你是第一次参与开源协作，建议先从文档和小功能优化入手。
