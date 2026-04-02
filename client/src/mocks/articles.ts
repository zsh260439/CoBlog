import type { Article } from '@/types'

type CoverPalette = {
  skyTop: string
  skyBottom: string
  glow: string
  surface: string
  silhouette: string
}

type ArticleSeed = Omit<Article, '_id' | 'updatedAt' | 'wordCount' | 'coverImage'> & {
  coverPalette: CoverPalette
}

const SHARED_COVER_IMAGE = '/images/about-hero.png'

function stripMarkdown(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[>#*_\-[\]()!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createCoverImage(title: string, palette: CoverPalette) {
  void title
  void palette
  return SHARED_COVER_IMAGE
}

function createArticle(seed: ArticleSeed, index: number): Article {
  const plainText = stripMarkdown(seed.content)

  return {
    ...seed,
    _id: `mock-article-${index + 1}`,
    updatedAt: seed.createdAt,
    wordCount: plainText.length,
    coverImage: createCoverImage(seed.title, seed.coverPalette)
  }
}

const learningPalette: CoverPalette = {
  skyTop: '#435077',
  skyBottom: '#1d2752',
  glow: '#f2aa72',
  surface: '#445f90',
  silhouette: '#101722'
}

const lifePalette: CoverPalette = {
  skyTop: '#8098b3',
  skyBottom: '#3a4e6c',
  glow: '#f5d4c1',
  surface: '#91a9c1',
  silhouette: '#202635'
}

const deployPalette: CoverPalette = {
  skyTop: '#35565f',
  skyBottom: '#19343f',
  glow: '#b6e0d8',
  surface: '#3f7074',
  silhouette: '#0f1e24'
}

const arrayContent = `
## 数组

js 中的数组很多内置方法的名字感觉比其他语言相对好记一点，写算法题的时候感觉说很方便 🫡

## 创建数组

\`\`\`js
// 字面量写法（推荐）
const fruits = ["Apple", "Orange", "Plum"];

// 构造函数写法（较少用）
const arr = new Array("Apple", "Orange");

// 创建固定长度并初始化
const marks = Array.from({ length: 5 }, (_, index) => index + 1);
\`\`\`

数组的创建优先使用字面量，因为语义更清晰，也不会踩到单参数构造函数会被当成长度的坑。

## 访问和修改元素

\`\`\`js
const colors = ["red", "green", "blue"];

console.log(colors[0]);
colors[1] = "cyan";
console.log(colors.at(-1));
\`\`\`

除了常规索引访问外，\`at()\` 在读取尾部元素时会更顺手，尤其在配合负索引时可读性更好。

## 数组方法 - 添加/删除

\`\`\`js
const queue = ["a", "b"];

queue.push("c");
queue.unshift("start");
queue.pop();
queue.shift();
\`\`\`

如果只需要在头尾增删，优先记住 \`push/pop/unshift/shift\` 这四个方法，它们几乎能覆盖最基础的场景。

## splice - 多功能修改

\`\`\`js
const members = ["Tom", "Jerry", "Lucy", "Luna"];

members.splice(1, 2, "Mina", "Rin");
// ["Tom", "Mina", "Rin", "Luna"]
\`\`\`

\`splice\` 本质上是“就地修改数组”，删、插、替都能做，所以它是数组操作里非常核心的一个方法。

## slice - 创建子数组

\`\`\`js
const numbers = [10, 20, 30, 40, 50];

const firstHalf = numbers.slice(0, 3);
const lastTwo = numbers.slice(-2);
\`\`\`

\`slice\` 不会修改原数组，更适合做截取和浅拷贝。

## concat - 合并数组

\`\`\`js
const frontend = ["HTML", "CSS"];
const runtime = ["Node", "Deno"];

const stack = frontend.concat(runtime, ["Bun"]);
\`\`\`

合并多个数组时 \`concat\` 的语义比手动循环更直接，也方便保留原数组不变。

## 遍历数组

\`\`\`js
const scores = [95, 88, 76];

scores.forEach((score, index) => {
  console.log(index, score);
});

for (const score of scores) {
  console.log(score);
}
\`\`\`

如果只关心副作用就用 \`forEach\`，如果需要配合 \`break\` 或 \`continue\`，就直接换回 \`for...of\`。

## 搜索数组

\`\`\`js
const tasks = [
  { id: 1, done: false },
  { id: 2, done: true },
];

const firstDone = tasks.find((task) => task.done);
const firstDoneIndex = tasks.findIndex((task) => task.done);
const hasPending = tasks.some((task) => !task.done);
\`\`\`

查“有没有”、查“第一个满足条件的元素”、查“索引”，这三个需求对应 \`some/find/findIndex\` 就够用了。

## 转换数组

\`\`\`js
const names = ["zsint", "coblog", "notes"];

const upperNames = names.map((name) => name.toUpperCase());
const visibleNames = names.filter((name) => name.length > 5);
\`\`\`

\`map\` 负责一一映射，\`filter\` 负责筛选，二者是日常写业务代码时使用频率非常高的一组组合。

## split 和 join

\`\`\`js
const text = "vue,typescript,markdown";
const parts = text.split(",");

const output = parts.join(" / ");
\`\`\`

这两个方法非常适合处理标签、路径片段、关键词列表等字符串和数组之间的来回转换。

## reduce/reduceRight

\`\`\`js
const prices = [19, 29, 35];

const total = prices.reduce((sum, price) => sum + price, 0);
\`\`\`

\`reduce\` 可以做聚合、分组、对象构建，但写起来容易过度抽象。简单场景下用它很强，复杂场景下要控制可读性。

## 其他实用方法

\`\`\`js
console.log(Array.isArray([1, 2, 3])); // true

const arr = [1, 2, [3, 4, [5, 6]]];
console.log(arr.flat(2));

const words = ["hello world", "the quick brown fox"];
console.log(words.flatMap((phrase) => phrase.split(" ")));
\`\`\`

\`Array.isArray\`、\`flat\`、\`flatMap\` 都是很好用但容易被忘的工具，记住后会明显提升处理数据的效率。

## 实用技巧

- 用 \`Array.from({ length: n })\` 快速创建指定长度的数据
- 配合展开运算符 \`[...]\` 做浅拷贝会比手写循环更干净
- 做条件拼接时，优先返回新数组，减少直接修改原数组带来的副作用

## 参考教程

- [现代 JavaScript 教程](https://zh.javascript.info/array)
- [MDN Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
`

const articleSeeds: ArticleSeed[] = [
  {
    slug: 'computer-architecture-notes-01',
    title: '计算机组成原理学习笔记01-概论',
    excerpt: '从指令执行、总线、存储器层次和 CPU 组成几个角度，先把计算机组成原理的整体轮廓搭起来。',
    summary: '这篇笔记先不急着钻细节，而是先把“计算机为什么能执行程序”这件事的全貌搭出来，适合作为后续复习的起点。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['学习', '成长'],
    createdAt: '2026-03-30T10:20:00.000Z',
    views: 42,
    comments: 2,
    likes: 6,
    coverPalette: learningPalette,
    content: `
## 为什么先学概论

先有整体结构，再谈细节，复习的时候才不会把寄存器、总线、控制器这些概念学成互相孤立的碎片。

## 计算机的基本组成

冯·诺依曼体系里，运算器、控制器、存储器、输入设备和输出设备共同组成一台完整的计算机系统。

## 指令执行流程

程序最终都会落到“取指、译码、执行”这一条路径上，CPU 的工作本质就是不断重复这个循环。

## 存储器层次

寄存器最快、主存次之、辅存更大但更慢，层次设计的目的就是在成本和速度之间取得平衡。

## 后续复习方式

后续笔记会沿着数据表示、运算方法、存储体系和 CPU 结构逐步展开。`
  },
  {
    slug: 'javascript-review-notes-05-iterable-map-set-object',
    title: 'JavaScript复习笔记05-可迭代对象-Map-Set-Object方法-解构赋值',
    excerpt: '把可迭代协议、Map/Set、对象操作方法和解构赋值放到同一条复习线上，避免概念分散。',
    summary: '这一篇主要整理对象和集合相关的基础能力，把遍历、映射、集合去重和结构拆解几个高频知识点串在一起。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['JavaScript', 'Map'],
    createdAt: '2026-03-29T14:36:00.000Z',
    views: 67,
    comments: 1,
    likes: 9,
    coverPalette: learningPalette,
    content: `
## 可迭代对象

只要对象实现了 \`Symbol.iterator\`，就可以被 \`for...of\` 遍历。

## Map 和 Set

Map 更适合键值映射，Set 更适合快速去重和存在性判断。

## Object 常用方法

\`Object.keys\`、\`Object.values\`、\`Object.entries\` 是最常见的一组组合。

## 解构赋值

解构可以让你更干净地从数组和对象中取值，也方便给默认值。`
  },
  {
    slug: 'javascript-review-notes-04-array',
    title: 'JavaScript复习笔记04-数组',
    excerpt: '围绕数组的创建、访问、搜索、转换和聚合，把最常用的方法整理成一篇适合随手翻阅的速记。',
    summary: '这篇博客系统地整理了 JavaScript 数组的核心知识点与应用技巧，文档首先介绍了数组的创建、访问与修改元素的方法，再到分类解释数组的内置方法和实用技巧，适合作为日常编码时的速查手册。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['JavaScript', '数组'],
    createdAt: '2026-03-28T10:28:00.000Z',
    views: 121,
    comments: 0,
    likes: 12,
    coverPalette: learningPalette,
    content: arrayContent
  },
  {
    slug: 'javascript-review-notes-03-object-conversion-number-string',
    title: 'JavaScript复习笔记03-对象转换-原始类型方法-数字类型-字符串',
    excerpt: '把对象到原始值的转换流程、数字类型细节和字符串方法放在一起复盘，适合补基础漏洞。',
    summary: '这篇更偏“容易混”的基础知识：对象是怎么转换成原始值的、数字和字符串有哪些经常忽略的小细节。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['JavaScript', '对象', '字符串'],
    createdAt: '2026-03-28T08:16:00.000Z',
    views: 86,
    comments: 0,
    likes: 8,
    coverPalette: learningPalette,
    content: `
## 对象到原始值的转换

对象在参与运算时会尝试调用 \`Symbol.toPrimitive\`、\`valueOf\`、\`toString\`。

## Number 类型

要特别注意精度问题、\`NaN\` 的传播规则以及数值转换的边界。

## 字符串方法

\`slice\`、\`substring\`、\`includes\`、\`trim\` 这些方法用得最频繁。`
  },
  {
    slug: 'javascript-review-notes-02-gc-this-constructor-symbol',
    title: 'JavaScript复习笔记02-垃圾回收、this、构造函数、?.、Symbol',
    excerpt: '一次性补齐运行时行为和语言特性里的几个高频考点：垃圾回收、this、构造函数与 Symbol。',
    summary: '这一篇把语义比较散的几个知识点串起来复习，重点是理解运行机制和语法行为，而不是死记 API。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['JavaScript', '对象', 'Symbol'],
    createdAt: '2026-03-24T20:10:00.000Z',
    views: 74,
    comments: 0,
    likes: 7,
    coverPalette: learningPalette,
    content: `
## 垃圾回收

JavaScript 里最常见的是可达性算法，只要对象还能从根出发被访问到，就不会被回收。

## this 绑定

普通函数、对象方法、箭头函数和构造函数中的 this 指向都不一样。

## 构造函数和 Symbol

构造函数负责实例化，Symbol 更适合做唯一标识或对象内部协议扩展。`
  },
  {
    slug: 'javascript-review-notes-01-types-nullish-copy',
    title: 'JavaScript复习笔记01-数据类型及其转化、??、对象基础、对象引用复制',
    excerpt: '作为整组 JS 复习的起点，这篇先回到数据类型、引用关系和空值合并这些最底层的知识点。',
    summary: '这一篇是整组复习的开头，把后续内容经常反复用到的基础概念集中整理，适合先建立统一认知。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['JavaScript', '对象'],
    createdAt: '2026-03-21T19:26:00.000Z',
    views: 95,
    comments: 2,
    likes: 11,
    coverPalette: learningPalette,
    content: `
## 基本类型与引用类型

理解“值”和“引用”是后面学习对象、数组、拷贝和比较的基础。

## ?? 与 ||

\`??\` 更适合判断真正的空值，避免把 \`0\`、空字符串这类合法值误伤。

## 浅拷贝与引用复制

对象赋值本质上传的是引用，如果需要隔离副作用，就要显式复制。`
  },
  {
    slug: 'holiday-notes-and-farewell',
    title: '辞乡——关于这个充实的寒假',
    excerpt: '把这个寒假里学习、生活和返程前的情绪整理下来，给自己一个完整的句号。',
    summary: '这篇更像生活随笔，不讲技巧，也不讲工程，而是把一段时间里真正留下来的感受收拢起来。',
    category: '日常',
    categorySlug: 'daily',
    tags: ['生活', '成长'],
    createdAt: '2026-03-08T08:22:00.000Z',
    views: 39,
    comments: 0,
    likes: 5,
    coverPalette: lifePalette,
    content: `
## 假期节奏

这个寒假比想象中充实，读了些书，也把想做很久的博客重新提上了日程。

## 一些变化

很多计划真正开始落地后，反而没有想象中那么难，难的是迈出第一步。

## 回程前

离开的时候依旧会不舍，但比起失落，更多的是想把积累继续延续下去。`
  },
  {
    slug: 'spring-and-fitness-drive',
    title: '开春了，又要开始东石了，我的健身动力与挣扎',
    excerpt: '记录开春之后重新把锻炼拉回生活节奏时，那些看似琐碎但很真实的心理波动。',
    summary: '不是鸡血式打卡，而是一次对“怎么把想做的事真正长期做下去”的记录。',
    category: '日常',
    categorySlug: 'daily',
    tags: ['生活', '健身'],
    createdAt: '2026-03-05T07:40:00.000Z',
    views: 33,
    comments: 1,
    likes: 4,
    coverPalette: lifePalette,
    content: `
## 为什么重新开始

冬天停下来的东西很多，开春以后就想把身体状态重新找回来。

## 最大阻力

真正难的不是练，而是持续安排时间、对抗懒惰和打破拖延。

## 记录的意义

把挣扎写下来，反而更容易看到自己有没有在往前走。`
  },
  {
    slug: 'deploy-feitwnd-website-guide',
    title: '关于如何使用部署FeiTwnd-Website详细教程',
    excerpt: '从环境准备、构建产物到服务器部署，把一套完整的网站部署流程串成可以照着执行的清单。',
    summary: '这篇主要是把“怎么把项目真正部署出去”这件事写成手册，方便以后复用，也方便别人直接照着做。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['部署', 'Vue', '博客'],
    createdAt: '2026-02-28T09:10:00.000Z',
    views: 110,
    comments: 3,
    likes: 14,
    coverPalette: deployPalette,
    content: `
## 环境准备

先准备 Node、包管理器、服务器权限和域名解析。

## 构建与上传

前端产物构建完成后，上传到服务器并配置正确的静态资源目录。

## 域名与 HTTPS

把 Nginx 配置和证书申请写清楚后，整套流程就完整了。`
  },
  {
    slug: 'ubuntu-nginx-java-project-and-proxy',
    title: 'Ubuntu下Nginx的部署后端项目(java为例)及配置Nginx代理',
    excerpt: '把 Java 后端项目放到 Ubuntu 上部署时，从进程管理到 Nginx 反向代理的一整套配置复盘。',
    summary: '这一篇更偏服务端部署，重点是项目怎么跑起来，以及前后端怎么通过代理连起来。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['Nginx', 'Ubuntu', '部署'],
    createdAt: '2026-02-22T13:18:00.000Z',
    views: 82,
    comments: 1,
    likes: 9,
    coverPalette: deployPalette,
    content: `
## 部署前检查

先确认端口、防火墙、JDK 版本和运行权限都没有问题。

## 反向代理配置

Nginx 的 server 块需要明确转发路径、超时时间和静态资源规则。

## 日志与排障

把访问日志和错误日志打开之后，很多问题会比盲猜更容易定位。`
  },
  {
    slug: 'ubuntu-nginx-multi-site-frontend',
    title: 'Ubuntu下Nginx的快速部署多网站(前端)',
    excerpt: '整理一份前端多站点部署的快速模板，重点是目录规划、server 块划分和静态资源管理。',
    summary: '如果你需要在一台服务器上挂多个前端站点，这篇会比从零试错更省时间。',
    category: '技术',
    categorySlug: 'technology',
    tags: ['Nginx', 'Ubuntu', '部署'],
    createdAt: '2026-02-21T17:20:00.000Z',
    views: 73,
    comments: 0,
    likes: 8,
    coverPalette: deployPalette,
    content: `
## 目录规划

多个前端项目最好提前规划统一的目录结构，后续维护会轻松很多。

## 多站点配置

每个站点独立的 server 块更清晰，出问题也更容易单独排查。

## 常见问题

资源路径、history 路由和缓存策略是最容易踩的几个坑。`
  },
  {
    slug: 'new-start-new-motivation',
    title: '新起点 新动力！',
    excerpt: '把搭建博客、整理内容和继续输出这几件事合在一起，作为这个阶段重新出发的起点。',
    summary: '这篇像站点的开场白：为什么开始、怎么开始，以及接下来想把这个地方写成什么样。',
    category: '心得',
    categorySlug: 'insight',
    tags: ['博客', '成长'],
    createdAt: '2026-02-21T10:03:00.000Z',
    views: 62,
    comments: 2,
    likes: 10,
    coverPalette: lifePalette,
    content: `
## 重大事件

历时将近一个月，博客终于从杂乱的原型一点点长成了现在的样子。

## 动机

真正让我想把它做下去的，不只是写技术笔记，而是想保留自己的阶段性痕迹。

## 起始与发展

回到最初那个黑白配色的版本，然后一点点把它迭代成更适合自己长期使用的状态。`
  }
]

export const mockArticles = articleSeeds
  .map(createArticle)
  .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))

export const archiveHeroImage = mockArticles.find((article) => article.slug === 'new-start-new-motivation')?.coverImage ?? ''

export function getMockArticles() {
  return mockArticles.map((article) => ({ ...article }))
}

export function findArticleBySlug(slug: string) {
  return mockArticles.find((article) => article.slug === slug) ?? null
}

export function findArticleById(id: string) {
  return mockArticles.find((article) => article._id === id) ?? null
}

export function getAdjacentArticles(slug: string) {
  const currentIndex = mockArticles.findIndex((article) => article.slug === slug)

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null
    }
  }

  return {
    previous: mockArticles[currentIndex - 1] ?? null,
    next: mockArticles[currentIndex + 1] ?? null
  }
}

export function getRelatedArticles(slug: string, limit = 5) {
  const currentArticle = findArticleBySlug(slug)

  if (!currentArticle) {
    return []
  }

  return mockArticles
    .filter((article) => article.slug !== slug)
    .map((article) => {
      const tagOverlap = article.tags.filter((tag) => currentArticle.tags.includes(tag)).length
      const score = (article.category === currentArticle.category ? 3 : 0) + tagOverlap

      return { article, score }
    })
    .sort((left, right) => right.score - left.score || +new Date(right.article.createdAt) - +new Date(left.article.createdAt))
    .slice(0, limit)
    .map((item) => item.article)
}
