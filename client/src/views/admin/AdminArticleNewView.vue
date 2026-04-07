<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import { ArrowLeft, Picture, Promotion } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryOptions } from '@/config/site'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { createArticle, getArticleById, updateArticle } from '@/servers/article'
import { useAppStore } from '@/store'
import { createSlugFromText } from '@/utils'
import type { AdminArticleForm } from '@/types/admin'
import type { ArticleCategory } from '@/types/article'

const route = useRoute()
const router = useRouter()

const { saveArticleDraft, getArticleDraft, clearArticleDraft } = useAppStore()
const { categories, tags, loadTaxonomies } = useTaxonomies()

const createDefaultForm = (): AdminArticleForm => ({
  title: '',
  slug: '',
  excerpt: '',
  summary: '',
  category: categoryOptions[0]?.label ?? '',
  categorySlug: categoryOptions[0]?.slug ?? '',
  tags: [],
  coverImage: '',
  content: ''
})

const form = reactive<AdminArticleForm>(createDefaultForm())

const submitLoading = ref(false)
const submitError = ref('')
const draftMode = ref(false)
const pageLoading = ref(false)
const slugTouched = ref(false)
const imageDialogVisible = ref(false)
const imageUrl = ref('')
const imageAlt = ref('')
const contentInputRef = ref<InstanceType<typeof ElInput> | null>(null)

const resolvedCategories = computed<ArticleCategory[]>(() => {
  if (categories.value.length) {
    return categories.value
  }

  return categoryOptions.map((item) => ({
    _id: item.slug,
    label: item.label,
    slug: item.slug,
    count: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
})

const selectedCategory = computed(() => {
  return resolvedCategories.value.find((item) => item.label === form.category) ?? null
})

const isEditMode = computed(() => typeof route.params.id === 'string' && route.params.id.length > 0)

const suggestedTags = computed(() => tags.value.slice(0, 16))

const syncCategory = () => {
  const currentCategory = resolvedCategories.value.find((item) => item.label === form.category)
  form.categorySlug = currentCategory?.slug ?? createSlugFromText(form.category, 32)
}

const addTag = (tag: string) => {
  const normalized = tag.trim()
  if (!normalized || form.tags.includes(normalized)) {
    return
  }

  form.tags.push(normalized)
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((item) => item !== tag)
}

const toggleTag = (tag: string) => {
  if (form.tags.includes(tag)) {
    removeTag(tag)
    return
  }

  addTag(tag)
}

const insertSnippetAtCursor = async (snippet: string, caretOffset = snippet.length) => {
  const textarea = contentInputRef.value?.textarea
  if (!textarea) {
    form.content += snippet
    return
  }

  const start = textarea.selectionStart ?? form.content.length
  const end = textarea.selectionEnd ?? form.content.length

  form.content = `${form.content.slice(0, start)}${snippet}${form.content.slice(end)}`

  await nextTick()
  const nextPosition = start + caretOffset
  textarea.focus()
  textarea.setSelectionRange(nextPosition, nextPosition)
}

const insertCodeBlock = async () => {
  await insertSnippetAtCursor('\n```js\n\n```\n', 7)
}

const openImageDialog = () => {
  imageUrl.value = ''
  imageAlt.value = ''
  imageDialogVisible.value = true
}

const insertImageMarkdown = async () => {
  const normalizedUrl = imageUrl.value.trim()
  if (!normalizedUrl) {
    ElMessage.warning('请先输入图片地址')
    return
  }

  const snippet = `\n![${imageAlt.value.trim() || '图片描述'}](${normalizedUrl})\n`
  imageDialogVisible.value = false
  await insertSnippetAtCursor(snippet)
}

const saveDraft = () => {
  saveArticleDraft({
    ...form,
    tags: [...form.tags],
    draftMode: true,
  })
  draftMode.value = true
  ElMessage.success('草稿已保存到当前会话')
}

const validateForm = () => {
  if (!form.title.trim()) return '请输入文章标题'
  if (!form.excerpt.trim()) return '请输入文章摘要'
  if (!form.content.trim()) return '请输入 Markdown 正文'
  if (!form.category.trim()) return '请选择文章分类'
  return ''
}

const publishArticle = async () => {
  syncCategory()
  submitError.value = ''

  const message = validateForm()
  if (message) {
    submitError.value = message
    return
  }

  submitLoading.value = true

  try {
    const payload = {
      ...form,
      slug: form.slug.trim(),
      summary: form.summary.trim() || form.excerpt.trim(),
      tags: form.tags,
    }

    if (isEditMode.value) {
      await updateArticle(String(route.params.id), payload)
      ElMessage.success('文章更新成功')
    } else {
      await createArticle(payload)
      clearArticleDraft()
      Object.assign(form, createDefaultForm())
      draftMode.value = false
      slugTouched.value = false
      ElMessage.success('文章发布成功')
    }

    router.push('/admin/articles')
  } catch (error: any) {
    submitError.value = error?.response?.data?.message || '文章发布失败，请检查后端服务是否正常'
  } finally {
    submitLoading.value = false
  }
}

const handlePrimaryAction = async () => {
  if (draftMode.value) {
    saveDraft()
    return
  }

  await publishArticle()
}

watch(
  () => form.title,
  (value) => {
    if (!slugTouched.value) {
      form.slug = createSlugFromText(value, 48)
    }
  }
)

watch(
  resolvedCategories,
  (value) => {
    if (!form.category && value.length) {
      form.category = value[0].label
      form.categorySlug = value[0].slug
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await loadTaxonomies(true)

  if (isEditMode.value) {
    pageLoading.value = true

    try {
      const result = await getArticleById(String(route.params.id))
      if (result.data) {
        Object.assign(form, {
          title: result.data.title,
          slug: result.data.slug,
          excerpt: result.data.excerpt,
          summary: result.data.summary,
          category: result.data.category,
          categorySlug: result.data.categorySlug,
          tags: [...result.data.tags],
          coverImage: result.data.coverImage ?? '',
          content: result.data.content,
        })
        slugTouched.value = true
      }
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
    tags: Array.isArray(cachedDraft.tags) ? cachedDraft.tags : [],
  })
  draftMode.value = Boolean(cachedDraft.draftMode)
  slugTouched.value = Boolean(cachedDraft.slug)
})
</script>

<template>
  <div class="article-create-page">
    <div class="article-create-page__titlebar">
      <button class="article-create-page__back" type="button" @click="router.push('/admin/articles')">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <strong>新建文章</strong>
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
          <label>摘要</label>
          <el-input v-model="form.excerpt" type="textarea" :rows="4" placeholder="请输入文章摘要" />
        </div>

        <div class="form-field">
          <div class="form-field__header">
            <label>正文内容 (Markdown)</label>

            <div class="editor-tools">
              <el-button size="small" @click="insertCodeBlock">插入代码块</el-button>
              <el-button size="small" :icon="Picture" @click="openImageDialog">插入图片</el-button>
            </div>
          </div>

          <el-input
            ref="contentInputRef"
            v-model="form.content"
            type="textarea"
            :rows="14"
            resize="vertical"
            placeholder="请输入 Markdown 格式的文章内容..."
            class="article-create-page__content"
          />
        </div>
      </section>

      <aside class="article-create-page__side">
        <section class="article-create-card">
          <h3>发布设置</h3>

          <div class="publish-row">
            <span>发布状态</span>
            <div class="publish-row__switch">
              <span>草稿</span>
              <el-switch v-model="draftMode" size="small" inline-prompt active-text="开" inactive-text="关" />
            </div>
          </div>

          <div class="publish-actions">
            <el-button class="publish-actions__ghost" @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" class="publish-actions__primary" :loading="submitLoading" @click="handlePrimaryAction">
              <el-icon><Promotion /></el-icon>
              {{ draftMode ? '保存草稿' : '发布' }}
            </el-button>
          </div>

          <div class="form-field form-field--compact">
            <label>路径</label>
            <el-input v-model="form.slug" placeholder="article-slug" @input="slugTouched = true" />
          </div>
        </section>

        <section class="article-create-card">
          <div class="card-title-row">
            <h3>分类</h3>
          </div>

          <el-select v-model="form.category" placeholder="选择分类" class="article-create-page__full" @change="syncCategory">
            <el-option v-for="item in resolvedCategories" :key="item.slug" :label="item.label" :value="item.label" />
          </el-select>

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
        </section>

        <section class="article-create-card">
          <h3>封面图片</h3>
          <el-input v-model="form.coverImage" placeholder="图片URL" />
        </section>
      </aside>
    </div>

    <el-dialog v-model="imageDialogVisible" title="插入图片" width="420px">
      <div class="dialog-field">
        <label>图片地址</label>
        <el-input v-model="imageUrl" placeholder="https://example.com/demo.png" />
      </div>

      <div class="dialog-field">
        <label>图片描述</label>
        <el-input v-model="imageAlt" placeholder="可选，默认图片描述" />
      </div>

      <template #footer>
        <el-button @click="imageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="insertImageMarkdown">插入</el-button>
      </template>
    </el-dialog>
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
.form-field label,
.dialog-field label {
  color: #111111;
}

.article-create-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.form-field,
.dialog-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-field__header,
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-field label,
.dialog-field label {
  font-size: 14px;
  font-weight: 600;
}

.editor-tools {
  display: flex;
  gap: 8px;
}

.article-create-page__content :deep(textarea) {
  min-height: 320px;
  font-family: var(--font-mono);
  line-height: 1.8;
}

.publish-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #303133;
  font-size: 14px;
}

.publish-row__switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #909399;
}

.publish-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
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

.article-create-page :deep(.el-input__inner::placeholder),
.article-create-page :deep(.el-textarea__inner::placeholder) {
  color: #a8abb2 !important;
}

.article-create-page__full {
  width: 100%;
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

.tag-custom {
  margin-top: 14px;
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

  .form-field__header,
  .card-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
