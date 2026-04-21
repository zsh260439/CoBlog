import { config as mdEditorConfig } from 'md-editor-v3'

let markdownConfigured = false

// 只在真正使用 Markdown 编辑/预览的组件里初始化一次 md-editor-v3 配置。
export const ensureMarkdownConfigured = () => {
  if (markdownConfigured) {
    return
  }

  mdEditorConfig({
    katexConfig(baseConfig) {
      return {
        ...baseConfig,
        // 文章正文里存在中文被 `$...$` 包裹的场景，这里只忽略该类 KaTeX 警告。
        strict(errorCode: string) {
          if (errorCode === 'unicodeTextInMathMode') {
            return 'ignore'
          }

          return 'warn'
        },
      }
    },
  })

  markdownConfigured = true
}
