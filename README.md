# CoBlog

一个适合大二阶段练手的全栈博客项目，包含博客前台、留言页和简单后台管理。

## 当前已实现功能

### 前台页面

- 首页展示
- 博客列表
- 文章详情页
- Markdown 渲染与代码高亮
- 文章目录提取与滚动高亮
- 分类页 / 标签页 / 归档页
- 关于页
- 留言板

### 后台页面

- 仪表盘
- 文章管理
- 新建文章 / 编辑文章
- 分类与标签管理
- 文章趋势图与分类分布图

### 服务端能力

- 文章增删改查
- 分类与标签接口
- 留言接口
- 图片上传接口

## 技术栈

- 前端：`Vue 3`、`TypeScript`、`Vite`、`Vue Router`、`Element Plus`
- 内容渲染：`md-editor-v3`、`markdown-it`、`highlight.js`
- 数据可视化：`ECharts`
- 后端：`NestJS`、`MongoDB`、`Mongoose`

## 项目结构

```text
.
├─ client/                 前端应用
│  ├─ src/components/      页面组件
│  ├─ src/views/           页面视图
│  ├─ src/types/           类型定义
│  ├─ src/servers/         接口请求层
│  └─ src/utils/           工具函数
├─ server/                 NestJS 服务端
│  ├─ src/articles/        文章模块
│  ├─ src/taxonomy/        分类与标签模块
│  ├─ src/message/         留言模块
│  └─ src/uploads/         上传模块
└─ README.md
```

## 本地运行

```bash
# 安装依赖
npm install

# 同时启动前后端
npm run dev
```

## 常用命令

```bash
# 只启动前端
npm run dev:client

# 只启动后端
npm run dev:server

# 构建前后端
npm run build
```

## 说明

这个仓库现在只保留项目运行和展示需要的内容，去掉了过程记录型文档，方便继续作为练手项目迭代。
