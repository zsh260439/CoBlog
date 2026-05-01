import type { MdHeadingId } from 'md-editor-v3'

export const createMarkdownHeadingId = (text: string, index: number) => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-') || 'section'

  return `${base}-${index}`
}

export const resolveMarkdownHeadingId: MdHeadingId = ({ text, index }) =>
  createMarkdownHeadingId(text, index)
