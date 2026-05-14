# CoBlog

![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square\&logo=vuedotjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square\&logo=vite\&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square\&logo=nestjs\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?style=flat-square\&logo=pnpm\&logoColor=white)
![Turbo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square\&logo=turborepo\&logoColor=white)
![License](https://img.shields.io/badge/License-UNLICENSED-6B7280?style=flat-square)

CoBlog 是一个基于 `Vue 3 + NestJS + MongoDB` 的个人全栈博客系统，包含前台内容站点、后台管理端、留言与访客统计、文章管理、图片上传以及 AI 助写能力。项目使用 `pnpm workspace + turbo` 组织为 monorepo，适合作为个人博客、作品集项目或全栈项目实践参考。

## 在线演示

- 站点首页：`https://coblog.top/`
- 关于页面：`https://coblog.top/about`
- 接口示例：`https://coblog.top/visits/stats`

## 功能特性

### 前台站点（Client）

- 文章列表、文章详情、分类、标签、归档完整浏览流程
- Markdown 内容渲染与文章阅读体验优化
- 留言板与站点互动功能
- 关于页与个人信息展示
- 首页视觉动画、技术图标、交互式展示
- 响应式布局，兼顾桌面端与移动端浏览

### 后台管理（Admin）

- 后台登录鉴权
- 文章新建、编辑、发布与管理
- 分类与标签管理
- 留言审核与处理
- 访客统计与基础看板展示
- 图片上传与内容管理支持

### 编辑与内容能力

- `md-editor-v3` 编辑器集成
- 图片上传能力
- 草稿自动保存
- 文章摘要与内容优化辅助

### AI 助手能力

- 接入 `DeepSeek Chat Completions API`
- 支持正文优化
- 支持摘要生成
- 支持流式对话式助写

## 第三方服务与可替代项

项目主体功能以前后端自有实现为主，但有少量能力会调用第三方服务。这里单独说明，方便二次使用时判断哪些可以直接沿用、哪些需要替换成你自己的方案。

### 图片相关

- 文章正文上传图片：不是第三方图床
  后台上传的文章图片会先上传到你自己的后端，再保存到 MongoDB，由接口 `/uploads/images/:id` 提供访问。这部分不依赖外部图片托管服务，部署后即可自给自足。
- 随机封面图：当前使用第三方图片接口
  后端的随机封面图能力当前会请求 `https://t.alcy.cc/fj`。这个更像是一个现成可用的公共图片 API，适合个人项目快速接入，但不建议把它当作唯一长期依赖。
- 可替代方案
  如果你不想依赖外部封面接口，可以改成以下任一方案：
  - 使用你自己的本地静态图片库
  - 使用自己维护的封面图集合或数据库字段
  - 接入自己的对象存储（如 OSS、COS、S3 兼容存储）
  - 改成固定默认封面，而不是随机获取

### AI 接口相关

- 当前使用 `DeepSeek Chat Completions API`
  AI 助写、摘要与内容优化能力依赖外部模型接口，不是本地模型推理。
- 费用说明
  这类接口是否免费，通常取决于平台当前政策、你的账户额度、活动赠送额度或套餐情况，不应默认认为永久免费。你现在的实现只要兼容 OpenAI 风格的聊天补全接口，就可以较容易替换。
- 可替代方案
  - 其他兼容 OpenAI 风格的模型服务
  - 自建模型网关
  - 关闭 AI 能力，仅保留普通博客功能

### IP 与访客信息相关

- 当前使用第三方 IP 信息查询接口
  后端归属地解析里调用了 `https://uapis.cn/api/v1/network/ipinfo` 来补充访客 IP 信息。
- 费用与稳定性说明
  这类接口很多提供免费额度或公共调用方式，但免费接口通常不保证长期稳定、速率和可用性，适合作为轻量项目的默认方案，不建议在高依赖场景中完全绑定。
- 可替代方案
  - 使用你自己的 IP 库
  - 使用其他地理位置查询服务
  - 直接关闭归属地展示，只保留基础访问统计

如果你想把这个项目作为自己的博客长期维护，建议把“第三方公共 API”理解为默认可跑通的起步方案，而不是不可替换的硬依赖。图片、AI、IP 归属地这三类能力都可以按自己的预算、稳定性要求和运维习惯替换成别的实现。

## 技术栈

### 前端（apps/client）

- 框架与语言：`Vue 3`、`TypeScript`
- 构建工具：`Vite`
- 路由：`Vue Router`
- UI 组件：`Element Plus`、`@element-plus/icons-vue`
- 样式方案：`UnoCSS`、`Sass`
- 组合式工具：`VueUse`
- 网络请求：`Axios`
- 图表：`ECharts`
- Markdown 编辑与预览：`md-editor-v3`
- 动画与可视化：`GSAP`、`Three.js`
- 工具库：`uuid`、`ua-parser-js`、`jwt-decode`、`pinyin-pro`、`simplex-noise`

### 后端（apps/server）

- 框架：`NestJS`
- 数据层：`Mongoose`、`MongoDB`
- 鉴权与安全：`JWT`、`bcrypt`、`httpOnly Cookie`
- 参数校验与转换：`class-validator`、`class-transformer`
- 文件上传：`multer`
- 配置管理：`@nestjs/config`
- 实时消息：`rxjs`
- 基础设施：`cookie-parser`、`reflect-metadata`
- 开发与规范：`ESLint`、`Prettier`、`typescript-eslint`

### AI 能力

- 模型接口：`DeepSeek Chat Completions API`
- 使用场景：正文优化、摘要生成、流式对话助写

### 工程化与协作

- Monorepo：`pnpm workspace`
- 构建编排：`Turborepo`
- 包管理与运行环境：`pnpm`、`Node.js`
- 共享类型：`@coblog/types`
- 代码规范：`ESLint`、`Prettier`

## 技术架构

```text
┌───────────────────────────────────────────────┐
│                 Nginx / Vite                  │
│      Static Assets + SPA Route Fallback       │
└───────────────────────┬───────────────────────┘
                        │
                        │ /api
                        ▼
               ┌────────────────────┐
               │   NestJS Server    │
               │   apps/server      │
               └─────────┬──────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   MongoDB    │
                  └──────────────┘

Client (Vue 3 + Vite) 与 Server (NestJS) 通过共享类型包 `packages/types` 协作，
由 `pnpm workspace + turbo` 统一管理构建与开发流程。
```

## 项目结构

```text
CoBlog/
├── apps/
│   ├── client/                    # Vue 前端站点与后台页面
│   │   ├── public/                # 静态资源（icons、fonts、images、audio）
│   │   └── src/                   # 页面、组件、路由、请求、样式
│   └── server/                    # NestJS 后端服务
│       ├── src/                   # controller / service / module / dto
│       └── dist/                  # 构建产物
├── packages/
│   └── types/                     # 前后端共享类型包
├── deploy/
│   └── nginx/                     # Nginx 配置参考
├── .github/
│   └── workflows/                 # GitHub Actions 自动部署流程
├── pnpm-workspace.yaml            # workspace 定义
├── turbo.json                     # turbo 任务编排
└── README.md
```

## 快速开始

### 环境要求

| 环境      | 版本要求      |
| ------- | --------- |
| Node.js | `>= 20`   |
| pnpm    | `>= 10`   |
| MongoDB | 本地或远程可用实例 |

### 1. 克隆项目

```bash
git clone https://github.com/zsh260439/CoBlog.git
cd CoBlog
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

在仓库根目录创建 `.env.development.local`，可以先按下面的最小示例填写：

```env
VITE_API_BASE_URL=http://localhost:3000

PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/coblog
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret
INIT_ADMIN_USERNAME=admin
INIT_ADMIN_PASSWORD=123456

DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-v4-flash
```

### 4. 启动开发环境

```bash
pnpm dev:server
pnpm dev:client
```

首次启动时，如果 `login` 集合为空，并且环境变量里提供了 `INIT_ADMIN_USERNAME` 与 `INIT_ADMIN_PASSWORD`，后端会自动创建一个管理员账号。创建完成后，后续重启不会重复覆盖已有管理员数据。

默认访问地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`

如果你希望通过一个命令并行启动工作区开发任务，也可以使用：

```bash
pnpm dev
```

## 常用命令

```bash
pnpm dev            # turbo 并行启动工作区开发任务
pnpm dev:client     # 仅启动前端
pnpm dev:server     # 仅启动后端

pnpm build          # 构建全部包
pnpm build:client   # 构建前端
pnpm build:server   # 构建后端
```

## 核心模块说明

### 前台内容站点

- 首页内容展示
- 文章阅读页
- 分类、标签、归档导航
- 留言页与互动功能
- 关于页内容展示

### 后台管理端

- 登录鉴权与后台入口
- 文章编辑与发布
- 分类标签管理
- 留言审核与处理
- 站点访问统计

### 管理员初始化

- 当前项目不提供公开注册入口。
- 当数据库中的 `login` 集合为空时，系统会尝试从环境变量读取：
  - `INIT_ADMIN_USERNAME`
  - `INIT_ADMIN_PASSWORD`
- 如果这两个值存在，后端启动时会自动创建第一条管理员账号。
- 一旦数据库中已经存在登录账号，后续重启不会重复创建，也不会覆盖原有管理员数据。
- 这意味着二次使用者不需要导入你的管理员数据库，只需要配置自己的初始化账号密码即可完成首次登录。

### 共享类型包

- `packages/types` 为前后端共享类型定义
- 避免接口字段在前后端重复维护
- 统一类型可以减少联调与重构成本

## 生产部署说明

当前项目仓库内已经保留了实际可用的部署参考文件：

- GitHub Actions：`.github/workflows/deploy.yml`
- Nginx 配置参考：`deploy/nginx/coblog.conf`

项目当前生产部署思路是：

1. 通过 GitHub Actions 在 push 到 `main` 后触发构建
2. 上传前端 `dist` 与后端 `dist` 到服务器
3. 远端使用 `pnpm` 安装服务端生产依赖
4. 使用 `pm2` 管理后端进程
5. 由 `nginx` 提供静态资源与反向代理

### 前端构建

```bash
pnpm build:client
```

构建产物位于：

```text
apps/client/dist
```

### 后端构建

```bash
pnpm build:server
```

构建产物位于：

```text
apps/server/dist
```

### Nginx 配置参考

可以参考仓库中的 `deploy/nginx/coblog.conf`。典型思路如下：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/apps/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 二次使用前建议修改的内容

如果你想把这个项目作为自己的博客或个人站点继续改造，建议优先检查下面这些内容：

- 站点名称与个人信息
- 域名与 API 地址
- 社交链接与关于页文案
- 默认图片、图标与静态资源
- 环境变量配置
- Nginx 域名与部署路径
- GitHub Actions 中的服务器地址与部署目录

这意味着它更适合作为“可参考、可二开”的真实项目，而不是完全零配置的模板项目。

## 开源协作

欢迎通过 `Issue` 或 `Pull Request` 参与改进：

- Bug 修复
- 功能增强
- 文档完善
- 性能优化

如果你是第一次参与开源协作，建议先从文档和小功能优化入手。

## License

当前仓库中的服务端 `package.json` 标记为 `UNLICENSED`。如果后续需要公开分发或作为可复用模板，建议再单独补充明确的开源协议文件与授权说明。
