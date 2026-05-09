# CoBlog

全栈博客项目，Vue 3 + NestJS + MongoDB，适合作为个人博客或练手作品。

## 功能

### 前台

- 首页 / 博客列表 / 文章详情
- Markdown 渲染 + 代码高亮
- 文章目录提取与滚动高亮
- 上一篇 / 下一篇导航、相关文章推荐
- 分类页 / 标签页 / 归档页
- 关于页 / 留言板
- 站点统计卡片

### 后台

- JWT 双 Token 登录（accessToken + httpOnly refreshToken）
- 仪表盘（文章趋势图、环形分类分布图）
- 文章增删改查、Markdown 编辑器
- 草稿防抖自动保存
- AI 辅助（MiniMax — 正文润色、摘要生成、对话追问）
- 分类 / 标签管理
- 图片上传

### 服务端

- 文章 CRUD、分类标签 CRUD
- 留言接口
- 图片上传接口
- JWT 鉴权 Guard、Token 轮转刷新
- AI 对接 MiniMax API

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3、TypeScript、Vite、Vue Router、Element Plus |
| 编辑器 | md-editor-v3 |
| 渲染 | markdown-it、highlight.js |
| 图表 | ECharts |
| 后端 | NestJS、MongoDB、Mongoose |
| 鉴权 | @nestjs/jwt、bcrypt、双 Token + httpOnly Cookie |
| AI | MiniMax API |

## 项目结构

```text
.
├── client/                        前端
│   ├── src/
│   │   ├── components/            通用组件
│   │   │   ├── blog/              博客卡片
│   │   │   ├── sidebar/           侧边栏（个人信息、站点统计）
│   │   │   └── ui/                布局组件（Header、Footer、PageHero）
│   │   ├── composables/           组合式函数
│   │   │   ├── useArticles.ts     文章列表
│   │   │   ├── useArticleDetail.ts 文章详情
│   │   │   ├── useTaxonomies.ts   分类标签
│   │   │   └── useDebounce.ts     通用防抖
│   │   ├── views/                 页面视图
│   │   │   ├── homeView/          首页
│   │   │   ├── postView/          文章详情
│   │   │   ├── aboutView/         关于
│   │   │   └── admin/             后台管理
│   │   ├── types/                 类型定义
│   │   ├── servers/               接口请求层
│   │   ├── http-utils/            axios 封装、401 拦截队列
│   │   ├── utils/                 工具函数（日期、slug、markdown 等）
│   │   ├── config/                配置
│   │   ├── router/                路由
│   │   └── store/                 状态存储（草稿）
│   └── public/
├── server/                        NestJS 后端
│   ├── src/
│   │   ├── auth/                  JWT 鉴权（Guard、双 Token、轮转刷新）
│   │   ├── articles/              文章模块
│   │   ├── taxonomy/              分类标签模块
│   │   ├── message/               留言模块
│   │   ├── uploads/               上传模块
│   │   ├── ai/                    AI 模块（MiniMax）
│   │   ├── utils/                 工具服务（随机封面图）
│   │   └── common/                公共工具（ApiResponse）
│   └── uploads/images/            图片存储
└── root
    ├── package.json               同时启动前后端
    └── README.md
```

## 本地运行

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run dev:client    # 只启动前端
npm run dev:server    # 只启动后端
npm run build         # 构建前后端
```

## 环境变量

```env
# 服务端 .env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_API_URL=https://api.minimax.chat/v1/text/chatcompletion_v2
MINIMAX_MODEL=MiniMax-M2.7
```
