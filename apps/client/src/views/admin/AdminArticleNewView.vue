<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ArrowLeft, Plus, Promotion } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { generateArticleExcerptWithAi } from '@/servers/ai'
import { useArticles } from '@/composables/useArticles'
import { ensureMarkdownConfigured } from '@/config/markdown'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { createArticle, getArticleById, updateArticle } from '@/servers/article'
import { uploadImage } from '@/servers/upload'
import { useArticleDraftStore } from '@/stores'
import { createSlugFromText } from '@/utils'
import type { AdminArticleForm } from '@/types/admin'
import { useDebounce } from '@/composables/useDebounce'
import ArticleAiDrawer from '@/components/ArticleAiDrawer.vue'
ensureMarkdownConfigured()
type MarkdownApplyMode = 'replace' | 'append'
type ArticleAiDrawerExpose = InstanceType<typeof ArticleAiDrawer> & {
  clearPendingResult: () => void
}

const route = useRoute()
const router = useRouter()
defineOptions({
  name: 'AdminArticleNewView'
})
const { saveArticleDraft, getArticleDraft, clearArticleDraft } = useArticleDraftStore()
const { categories, tags, loadTaxonomies, ensureCategoryItem, ensureTagItem } = useTaxonomies()
const { articles, loadArticles, setArticles } = useArticles()
// 创建文章表单的默认值
const createDefaultForm = (): AdminArticleForm => ({
  title: '',
  slug: '',
  excerpt: '',
  category:'',
  categorySlug: '',
  tags: [],
  coverImage: '',
  content: ''
})

const form = reactive<AdminArticleForm>(createDefaultForm())

const submitLoading = ref(false)
const submitError = ref('')
const pageLoading = ref(false)
const slugTouched = ref(false)
const aiInstruction = ref('')
const aiDrawerVisible = ref(false)
const aiWritingActive = ref(false)
const aiDrawerRef = ref<ArticleAiDrawerExpose | null>(null)
const aiMarkdownResult = ref<{ content: string; mode: MarkdownApplyMode } | null>(null)
const aiMarkdownOriginalContent = ref<string | null>(null)
const customCategoryName = ref('')
const customTagName = ref('')

const resolvedCategories = computed(() => categories.value)

// 根据当前已选分类，拿到完整分类对象
const selectedCategory = computed(() => {
  return resolvedCategories.value.find((item) => item.label === form.category) || null
})

// 判断当前页面是否处于编辑文章模式
const isEditMode = computed(() => String(route.params.id || '').length > 0)

// 已选标签必须优先展示，否则 AI 新标签写进 form 后会“看不见”。
const suggestedTags = computed(() => {
  const baseTags = tags.value.slice(0, 16)
  const baseLabels = new Set(baseTags.map((tag) => tag.label))
  const selectedOnlyTags = form.tags
    .filter((label) => !baseLabels.has(label))
    .map((label) => ({
      _id: `selected-${label}`,
      label,
      slug: createSlugFromText(label, 32),
      count: 0,
      createdAt: '',
      updatedAt: '',
    }))

  return [...selectedOnlyTags, ...baseTags]
})

// 在切换分类时同步更新 categorySlug
const syncCategory = () => {
  const currentCategory = resolvedCategories.value.find((item) => item.label === form.category)
  form.categorySlug = currentCategory ? currentCategory.slug : createSlugFromText(form.category, 32)
}

// 向文章表单里添加一个标签
const addTag = (tag: string) => {
  const normalized = tag.trim()
  if (!normalized || form.tags.includes(normalized)) {
    return
  }

  form.tags.push(normalized)
}

// 从文章表单里移除一个标签
const removeTag = (tag: string) => {
  form.tags = form.tags.filter((item) => item !== tag)
}

// 点击标签按钮时，在“添加/移除”之间切换
const toggleTag = (tag: string) => {
  if (form.tags.includes(tag)) {
    removeTag(tag)
    return
  }

  addTag(tag)
}

// 上传单张图片
const stripTrailingAiTaxonomyNotes = (content: string) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const taxonomyLinePattern = /^\s*(?:[-*]\s*)?(?:\*\*)?\s*(?:标签|分类)(?:建议)?\s*(?:\*\*)?\s*[:：]/

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines.length - index > 12) {
      break
    }

    if (taxonomyLinePattern.test(lines[index])) {
      return lines.slice(0, index).join('\n').trim()
    }
  }

  return content.trim()
}

const uploadSingleImage = async (file: File) => {
  const result = await uploadImage(file)
  const url = result.data.url

  return {
    url,
    alt: file.name,
    title: file.name,
  }
}

// 供 md-editor-v3 调用的批量图片上传入口
const handleUploadImages = async (
  files: File[],
  callback: (urls: Array<{ url: string; alt: string; title: string }>) => void
) => {
  try {
    callback(await Promise.all(files.map(uploadSingleImage)))
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '图片上传失败')
  }
}

const saveDraft = () => {
  const rawForm = toRaw(form)
  saveArticleDraft({
    ...rawForm,
    tags: [...rawForm.tags],
  })
  ElMessage.success('草稿已保存')
}
//创建防抖
const { debouncedFn: debouncedSaveDraft, cancel: cancelAutoSave } = useDebounce(saveDraft, 5000)

const handleManualSave = () => {
  cancelAutoSave()
  saveDraft()
}
// 提交前检查发文必填项是否完整
const validateForm = () => {
  if (!form.title.trim()) return '请输入文章标题'
  if (!form.content.trim()) return '请输入 Markdown 正文'
  if (!form.category.trim()) return '请选择文章分类'
  return ''
}

const handleGenerateExcerpt = async () => {
  if (!form.content.trim()) {
    ElMessage.warning('正文不存在,无法生成摘要')
    return
  }
  try {
    const result = await generateArticleExcerptWithAi({
      title: form.title.trim(),
      content: form.content,
      instruction: aiInstruction.value.trim(),
      excerptLength: 120,
    })

    const excerpt = result.data.excerpt.trim()

    form.excerpt = excerpt
    ElMessage.success('AI 摘要已生成')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || 'AI 摘要生成失败')
  }
}

const handleReplaceContentByAi = (content: string) => {
  form.content = content
}

const handleAppendContentByAi = (content: string) => {
  form.content = `${form.content.trim()}\n\n${content}`.trim()
}

const handleUpdateTitleByAi = (title: string) => {
  form.title = title
}

const handleUpdateExcerptByAi = (excerpt: string) => {
  form.excerpt = excerpt
}

const handleSuggestTaxonomyByAi = async (payload: { category?: string; tags: string[] }) => {
  if (payload.category) {
    const category = await ensureCategoryItem({
      label: payload.category,
      slug: createSlugFromText(payload.category, 32),
    })
    form.category = category.label
    form.categorySlug = category.slug
  }

  const nextTags = await Promise.all(
    payload.tags.map((tag) => {
      return ensureTagItem({
        label: tag,
        slug: createSlugFromText(tag, 32),
      })
    }),
  )
  form.tags = nextTags.map((tag) => tag.label)
}

const handleAiWorkingChange = (value: boolean) => {
  aiWritingActive.value = value
}

const formatAiMarkdownContent = (value: { content: string; mode: MarkdownApplyMode }) => {
  const content = stripTrailingAiTaxonomyNotes(value.content)
  const originalContent = aiMarkdownOriginalContent.value || form.content

  if (value.mode === 'append') {
    return `${originalContent.trim()}\n\n${content}`.trim()
  }

  return content
}

const applyAiMarkdownDraftToEditor = (value: { content: string; mode: MarkdownApplyMode }) => {
  if (aiMarkdownOriginalContent.value === null) {
    aiMarkdownOriginalContent.value = form.content
  }

  form.content = formatAiMarkdownContent(value)
}

const handleAiMarkdownResultChange = (value: { content: string; mode: MarkdownApplyMode } | null) => {
  if (!value) {
    if (aiMarkdownOriginalContent.value !== null && aiMarkdownResult.value) {
      form.content = aiMarkdownOriginalContent.value
    }
    aiMarkdownResult.value = null
    aiMarkdownOriginalContent.value = null
    return
  }

  aiMarkdownResult.value = {
    ...value,
    content: stripTrailingAiTaxonomyNotes(value.content),
  }
}

const handleAiMarkdownDraftChange = (value: { content: string; mode: MarkdownApplyMode } | null) => {
  if (!value) {
    return
  }

  const sanitizedValue = {
    ...value,
    content: stripTrailingAiTaxonomyNotes(value.content),
  }

  applyAiMarkdownDraftToEditor(sanitizedValue)
  aiMarkdownResult.value = sanitizedValue
}

const clearAiMarkdownResult = () => {
  aiMarkdownResult.value = null
  aiMarkdownOriginalContent.value = null
  aiDrawerRef.value?.clearPendingResult()
}

const applyAiMarkdownResult = (mode: MarkdownApplyMode) => {
  if (!aiMarkdownResult.value) {
    return
  }

  const originalContent = aiMarkdownOriginalContent.value || ''
  const nextContent = stripTrailingAiTaxonomyNotes(aiMarkdownResult.value.content)

  form.content = mode === 'append'
    ? `${originalContent.trim()}\n\n${nextContent}`.trim()
    : nextContent

  ElMessage.success(mode === 'append' ? 'AI 内容已追加到正文末尾' : 'AI 内容已替换正文')
  clearAiMarkdownResult()
}

const rejectAiMarkdownResult = () => {
  if (aiMarkdownOriginalContent.value !== null) {
    form.content = aiMarkdownOriginalContent.value
  }
  clearAiMarkdownResult()
  ElMessage.info('已拒绝本次 AI Markdown 结果')
}

const handleCreateCategoryInline = async () => {
  const label = customCategoryName.value.trim()
  if (!label) {
    ElMessage.warning('请输入分类名称')
    return
  }

  const category = await ensureCategoryItem({
    label,
    slug: createSlugFromText(label, 32),
  })
  form.category = category.label
  form.categorySlug = category.slug
  customCategoryName.value = ''
  ElMessage.success('分类已新增并选中')
}

const handleCreateTagInline = async () => {
  const label = customTagName.value.trim()
  if (!label) {
    ElMessage.warning('请输入标签名称')
    return
  }

  const tag = await ensureTagItem({
    label,
    slug: createSlugFromText(label, 32),
  })
  addTag(tag.label)
  customTagName.value = ''
  ElMessage.success('标签已新增并选中')
}

// 发布和编辑共用这一条提交流程：先补摘要，再根据当前模式决定 create 还是 update。
const ensureFormTaxonomies = async () => {
  if (form.category.trim()) {
    const category = await ensureCategoryItem({
      label: form.category.trim(),
      slug: form.categorySlug.trim() || createSlugFromText(form.category, 32),
    })
    form.category = category.label
    form.categorySlug = category.slug
  }

  const ensuredTags = await Promise.all(
    form.tags.map((tag) => {
      return ensureTagItem({
        label: tag,
        slug: createSlugFromText(tag, 32),
      })
    }),
  )
  form.tags = ensuredTags.map((tag) => tag.label)
}

const publishArticle = async () => {
  syncCategory()
  submitError.value = ''

  const message = validateForm()
  if (message) {
    submitError.value = message
    return
  }

  cancelAutoSave()
  submitLoading.value = true

  try {
    if (!form.excerpt.trim()) {
      await handleGenerateExcerpt()
    }
    await ensureFormTaxonomies()
    const payload = {
      ...form,
      slug: form.slug.trim(),
      tags: form.tags,
    }
    if (isEditMode.value) {
      const result = await updateArticle(String(route.params.id), payload)
      setArticles(
        articles.value.map((item) => (item._id === result.data._id ? result.data : item))
      )
      await loadTaxonomies(true)
      ElMessage.success('文章更新成功')
    } else {
      const result = await createArticle(payload)
      setArticles([result.data, ...articles.value])
      await loadTaxonomies(true)
      clearArticleDraft()
      Object.assign(form, createDefaultForm())
      slugTouched.value = false
      ElMessage.success('文章发布成功')
    }

    cancelAutoSave()
    router.push('/admin/articles')
  } catch (error: any) {
    submitError.value = error?.response?.data?.message || '文章发布失败，请检查后端服务是否正常'
  } finally {
    submitLoading.value = false
  }
}

// 在用户未手动修改 slug 时，根据标题自动生成路径
watch(
  () => form.title,
  (value) => {
    form.slug = createSlugFromText(value, 48)
  }
)

//监视草稿 防抖自动保存避免退出
watch(form ,
() => {
  if(isEditMode.value) return
  if(!form.title.trim() && !form.content.trim()) return
  debouncedSaveDraft()
}, {
  deep: true
})
// 页面初始化时加载 taxonomy，并根据模式回填草稿或文章详情
onMounted(async () => {
  await Promise.all([loadTaxonomies(), loadArticles()])

  if (isEditMode.value) {
    pageLoading.value = true

    try {
      const result = await getArticleById(String(route.params.id))
      Object.assign(form, {
        title: result.data.title,
        slug: result.data.slug,
        excerpt: result.data.excerpt,
        category: result.data.category,
        categorySlug: result.data.categorySlug,
        tags: [...result.data.tags],
        coverImage: result.data.coverImage,
        content: result.data.content,
      })
      slugTouched.value = true
    } catch (error: any) {
      submitError.value = error?.response?.data?.message || '文章加载失败'
    } finally {
      pageLoading.value = false
    }

    return
  }

  const cachedDraft = getArticleDraft()
  if (!cachedDraft) {
    return
  }

  Object.assign(form, {
    ...createDefaultForm(),
    ...cachedDraft,
    tags: cachedDraft.tags,
  })
  slugTouched.value = Boolean(cachedDraft.slug)
})
</script>
<template>
  <div class="article-create-page">
    <div class="article-create-page__titlebar">
      <button class="article-create-page__back" type="button" @click="router.push('/admin/articles')">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <strong>{{ isEditMode ? '编辑文章' : '新建文章' }}</strong>
    </div>

    <el-alert
      v-if="submitError"
      :title="submitError"
      type="error"
      :closable="false"
      show-icon
      class="article-create-page__alert"
    />

    <div class="article-create-page__layout" v-loading="pageLoading">
      <section class="article-create-card article-create-card--main">
        <div class="form-field">
          <label>标题</label>
          <el-input v-model="form.title" placeholder="请输入文章标题" size="large" />
        </div>

        <div class="form-field">
          <label>摘要（AI自动生成）：</label>
          <el-input v-model="form.excerpt" type="textarea" :rows="4" placeholder="可手动填写摘要；留空时发布前自动生成" />
        </div>

        <div class="form-field">
          <label>正文内容 (Markdown)</label>

          <div class="article-create-page__editor-wrap" :class="{ 'article-create-page__editor-wrap--locked': aiWritingActive }">
            <MdEditor
              v-model="form.content"
              class="article-create-page__editor"
              theme="light"
              preview-theme="github"
              code-theme="atom"
              language="zh-CN"
              placeholder="请输入 Markdown 格式的文章内容..."
              :toolbars-exclude="['save', 'github', 'catalog']"
              :on-upload-img="handleUploadImages"
            />
            <div v-if="aiWritingActive" class="article-create-page__editor-lock">
              AI 正在生成内容，正文编辑区已临时锁定
            </div>
            <div v-else-if="aiMarkdownResult" class="article-create-page__editor-ai-actions">
              <el-button size="small" @click="rejectAiMarkdownResult">&#x62D2;&#x7EDD;</el-button>
              <el-button size="small" @click="applyAiMarkdownResult('replace')">&#x66FF;&#x6362;</el-button>
              <el-button size="small" type="primary" @click="applyAiMarkdownResult('append')">&#x8FFD;&#x52A0;</el-button>
            </div>
          </div>
        </div>
      </section>

      <aside class="article-create-page__side">
        <section class="article-create-card">
          <h3>发布设置</h3>

          <div class="publish-actions">
            <el-button class="publish-actions__ghost" @click="handleManualSave">保存草稿</el-button>
            <el-button type="primary" class="publish-actions__primary" :loading="submitLoading" @click="publishArticle">
              <el-icon><Promotion /></el-icon>
              {{ isEditMode ? '更新文章' : '发布' }}
            </el-button>
          </div>

          <div class="form-field form-field--compact">
            <label>路径</label>
            <el-input v-model="form.slug" placeholder="article-slug" @input="slugTouched = true" />
          </div>
        </section>

        <section class="article-create-card">
          <h3>AI 助写</h3>

          <div class="form-field form-field--compact">
            <label>补充要求</label>
            <el-input
              v-model="aiInstruction"
              type="textarea"
              :rows="4"
              placeholder="例如：保留我的学习口吻，但帮我把 Markdown 标题、列表和总结整理得更规范"
            />
          </div>

          <div class="publish-actions publish-actions--stack">
            <el-button @click="aiDrawerVisible = true">
              打开 AI 写作工作台
            </el-button>
          </div>

          <p class="taxonomy-hint">AI 只会基于当前标题和正文生成内容，发布前建议再自己校对一遍。</p>
        </section>

        <section class="article-create-card">
          <div class="card-title-row">
            <h3>分类</h3>
          </div>

          <el-select v-model="form.category" placeholder="选择分类" class="article-create-page__full" @change="syncCategory">
            <el-option v-for="item in resolvedCategories" :key="item.slug" :label="item.label" :value="item.label" />
          </el-select>

          <div class="inline-create">
            <el-input v-model="customCategoryName" placeholder="新分类名称" />
            <el-button :icon="Plus" @click="handleCreateCategoryInline">新增</el-button>
          </div>

          <p v-if="selectedCategory" class="taxonomy-hint">当前分类 slug：{{ selectedCategory.slug }}</p>
        </section>

        <section class="article-create-card">
          <h3>标签</h3>

          <div class="tag-group">
            <button
              v-for="tag in suggestedTags"
              :key="tag._id"
              type="button"
              class="tag-chip"
              :class="{ 'tag-chip--active': form.tags.includes(tag.label) }"
              @click="toggleTag(tag.label)"
            >
              {{ tag.label }}
            </button>
          </div>

          <div class="inline-create">
            <el-input v-model="customTagName" placeholder="新标签名称" />
            <el-button :icon="Plus" @click="handleCreateTagInline">新增</el-button>
          </div>
        </section>

        <section class="article-create-card">
          <h3>封面图片</h3>
          <el-input v-model="form.coverImage" placeholder="图片URL" />
        </section>
      </aside>
    </div>

    <ArticleAiDrawer
      ref="aiDrawerRef"
      v-model:visible="aiDrawerVisible"
      :title="form.title"
      :content="form.content"
      :instruction="aiInstruction"
      @replace-content="handleReplaceContentByAi"
      @append-content="handleAppendContentByAi"
      @update-title="handleUpdateTitleByAi"
      @update-excerpt="handleUpdateExcerptByAi"
      @suggest-taxonomy="handleSuggestTaxonomyByAi"
      @working-change="handleAiWorkingChange"
      @markdown-result-change="handleAiMarkdownResultChange"
      @markdown-draft-change="handleAiMarkdownDraftChange"
    />
  </div>
</template>

<style scoped>
.article-create-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-create-page__titlebar {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  color: #303133;
}

.article-create-page__titlebar strong {
  font-size: 18px;
  font-weight: 700;
}

.article-create-page__back {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #303133;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.article-create-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 300px;
  gap: 20px;
  align-items: start;
}

.article-create-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  padding: 22px 20px;
}

.article-create-card--main,
.article-create-page__side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-create-card h3,
.form-field label {
  color: #111111;
}

.article-create-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
}

.article-create-page__editor-wrap {
  position: relative;
}

.article-create-page__editor-wrap--locked .article-create-page__editor {
  pointer-events: none;
  user-select: none;
}

.article-create-page__editor-lock {
  position: absolute;
  inset: auto 14px 14px auto;
  z-index: 3;
  padding: 8px 12px;
  border: 1px solid rgba(209, 213, 219, 0.86);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #374151;
  font-size: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(12px);
}

.article-create-page__editor-ai-actions {
  position: absolute;
  inset: auto 14px 14px auto;
  z-index: 3;
  display: flex;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(209, 213, 219, 0.86);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(12px);
}

.article-create-page__editor-ai-actions :deep(.el-button--primary) {
  --el-button-bg-color: #111111;
  --el-button-border-color: #111111;
  --el-button-hover-bg-color: #2c2c2c;
  --el-button-hover-border-color: #2c2c2c;
}

.article-create-page__editor {
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
}

.article-create-page__editor :deep(.md-editor) {
  border: none;
}

.article-create-page__editor :deep(.md-editor-toolbar-wrapper) {
  background: #fafafa;
}

.article-create-page__editor :deep(.md-editor-content) {
  font-family: var(--font-mono);
}

.article-create-page__editor :deep(.md-editor-input)::placeholder,
.article-create-page__editor :deep(textarea::placeholder) {
  color: #d7dde6 !important;
}

.publish-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

.publish-actions--stack {
  grid-template-columns: 1fr;
}

.publish-actions--stack .el-button + .el-button {
  margin-left: 0;
}

.publish-actions__ghost,
.publish-actions__primary {
  width: 100%;
}

.publish-actions__primary {
  --el-button-bg-color: #111111;
  --el-button-border-color: #111111;
  --el-button-hover-bg-color: #2c2c2c;
  --el-button-hover-border-color: #2c2c2c;
}

.form-field--compact {
  margin-top: 16px;
}

.article-create-page :deep(.el-input__wrapper),
.article-create-page :deep(.el-textarea__inner) {
  background: #ffffff !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  color: #303133 !important;
  border: none !important;
}

.article-create-page :deep(.el-input__wrapper:hover),
.article-create-page :deep(.el-textarea__inner:hover) {
  background: #ffffff !important;
  box-shadow: 0 0 0 1px #c0c4cc inset !important;
}

.article-create-page :deep(.el-input.is-focus .el-input__wrapper),
.article-create-page :deep(.el-input__wrapper.is-focus),
.article-create-page :deep(.el-input__wrapper:focus-within),
.article-create-page :deep(.el-textarea__inner:focus) {
  background: #ffffff !important;
  box-shadow: 0 0 0 1px #111111 inset !important;
}

.article-create-page :deep(.el-input__inner),
.article-create-page :deep(.el-textarea__inner) {
  color: #303133 !important;
  -webkit-text-fill-color: #303133 !important;
}


.article-create-page :deep(input::-webkit-input-placeholder),
.article-create-page :deep(textarea::-webkit-input-placeholder),
.article-create-page :deep(.el-input__inner::-webkit-input-placeholder),
.article-create-page :deep(.el-textarea__inner::-webkit-input-placeholder) {
  color: #d7dde6 !important;
  -webkit-text-fill-color: #d7dde6 !important;
}



.article-create-page__full {
  width: 100%;
}

.inline-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  margin-top: 12px;
}

.taxonomy-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #909399;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #ffffff;
  color: #606266;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.tag-chip--active {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

@media (max-width: 1100px) {
  .article-create-page__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .article-create-card {
    padding: 18px 16px;
    border-radius: 16px;
  }

  .publish-actions {
    grid-template-columns: 1fr;
  }

  .card-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
