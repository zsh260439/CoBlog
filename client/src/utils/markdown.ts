import markdownIt from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs'
import { API_BASE_URL } from '@/config/http'
import type { MarkdownHeading } from '@/types/content'

// 为标题生成稳定的锚点 id
function createSlug(text: string, usedIds: Map<string, number>) {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-') || 'section'

  const currentCount = usedIds.get(baseSlug) ?? 0
  usedIds.set(baseSlug, currentCount + 1)

  return currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`
}

// 创建 markdown 解析器，并按需给标题注入 id
function createMarkdownParser(withHeadingIds: boolean) {
  const usedIds = new Map<string, number>()
  const parser = markdownIt({
    html: true,
    linkify: true,
    typographer: true
  }).use(highlightjs)

  if (withHeadingIds) {
    parser.renderer.rules.heading_open = (
      tokens: any[],
      index: number,
      options: any,
      _env: any,
      self: any
    ) => {
      const inlineToken = tokens[index + 1]
      const headingText = inlineToken?.content ?? ''
      const headingId = createSlug(headingText, usedIds)

      tokens[index].attrSet('id', headingId)
      return self.renderToken(tokens, index, options)
    }
  }

  return parser
}

// 渲染 markdown，并把相对上传图片路径补成完整后端地址
export function renderMarkdown(content: string) {
  return createMarkdownParser(true)
    .render(content)
    .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
}

// 从 markdown 文本里提取目录标题结构
export function extractHeadings(content: string): MarkdownHeading[] {
  const parser = createMarkdownParser(false)
  const tokens = parser.parse(content, {})
  const usedIds = new Map<string, number>()
  const headings: MarkdownHeading[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token.type !== 'heading_open') {
      continue
    }

    const level = Number(token.tag.replace('h', ''))
    const inlineToken = tokens[index + 1]
    const text = inlineToken?.content ?? ''

    if (!text || level > 3) {
      continue
    }

    headings.push({
      id: createSlug(text, usedIds),
      level,
      text
    })
  }

  return headings
}
