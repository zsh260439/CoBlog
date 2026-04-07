<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { createSlugFromText } from '@/utils'
import type { AdminTaxonomyForm } from '@/types/admin'

const { categories, tags, isLoading, loadTaxonomies, createCategoryItem, createTagItem } = useTaxonomies()

const categoryDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const submittingCategory = ref(false)
const submittingTag = ref(false)
const tagSlugEdited = ref(false)
const categorySlugEdited = ref(false)

const categoryForm = reactive<AdminTaxonomyForm>({
  label: '',
  slug: '',
})

const tagForm = reactive<AdminTaxonomyForm>({
  label: '',
  slug: '',
})

const resetCategoryForm = () => {
  categoryForm.label = ''
  categoryForm.slug = ''
  categorySlugEdited.value = false
}

const resetTagForm = () => {
  tagForm.label = ''
  tagForm.slug = ''
  tagSlugEdited.value = false
}

const syncCategorySlug = () => {
  //如果用户没有编辑 slug，自动生成
  if (!categorySlugEdited.value) {
    categoryForm.slug = createSlugFromText(categoryForm.label, 32)
  }
}

const syncTagSlug = () => {
  if (!tagSlugEdited.value) {
    tagForm.slug = createSlugFromText(tagForm.label, 32)
  }
}

const submitCategory = async () => {
  if (!categoryForm.label.trim() || !categoryForm.slug.trim()) {
    ElMessage.warning('请先填写完整的分类名称和 slug')
    return
  }

  submittingCategory.value = true

  try {
    await createCategoryItem({
      label: categoryForm.label.trim(),
      slug: categoryForm.slug.trim(),
    })
    ElMessage.success('分类新增成功')
    categoryDialogVisible.value = false
    resetCategoryForm()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '分类新增失败')
  } finally {
    submittingCategory.value = false
  }
}

const submitTag = async () => {
  if (!tagForm.label.trim() || !tagForm.slug.trim()) {
    ElMessage.warning('请先填写完整的标签名称和 slug')
    return
  }

  submittingTag.value = true

  try {
    await createTagItem({
      label: tagForm.label.trim(),
      slug: tagForm.slug.trim(),
    })
    ElMessage.success('标签新增成功')
    tagDialogVisible.value = false
    resetTagForm()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '标签新增失败')
  } finally {
    submittingTag.value = false
  }
}

const handlePendingAction = (label: string) => {
  ElMessage.info(`${label} 后续再接真实管理能力`)
}

onMounted(() => {
  void loadTaxonomies(true)
})
</script>

<template>
  <div class="taxonomy-page">
    <section class="taxonomy-card">
      <div class="taxonomy-card__header">
        <h3>分类管理 ({{ categories.length }})</h3>
        <el-button type="primary" class="taxonomy-card__add" :icon="Plus" @click="categoryDialogVisible = true">
          新增
        </el-button>
      </div>

      <el-table :data="categories" v-loading="isLoading" empty-text="暂无分类数据">
        <el-table-column prop="label" label="名称" min-width="120" />
        <el-table-column prop="slug" label="Slug" min-width="160" />
        <el-table-column prop="count" label="文章数" width="100" align="center" />
        <el-table-column label="操作" width="110" align="center">
          <template #default="{ row }">
            <div class="taxonomy-card__actions">
              <el-button link :icon="Edit" @click="handlePendingAction(`编辑分类 ${row.label}`)" />
              <el-button link :icon="Delete" @click="handlePendingAction(`删除分类 ${row.label}`)" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="taxonomy-card">
      <div class="taxonomy-card__header">
        <h3>标签管理 ({{ tags.length }})</h3>
        <el-button type="primary" class="taxonomy-card__add" :icon="Plus" @click="tagDialogVisible = true">
          新增
        </el-button>
      </div>

      <el-table :data="tags" v-loading="isLoading" empty-text="暂无标签数据">
        <el-table-column prop="label" label="名称" min-width="120" />
        <el-table-column prop="slug" label="Slug" min-width="160" />
        <el-table-column prop="count" label="文章数" width="100" align="center" />
        <el-table-column label="操作" width="110" align="center">
          <template #default="{ row }">
            <div class="taxonomy-card__actions">
              <el-button link :icon="Edit" @click="handlePendingAction(`编辑标签 ${row.label}`)" />
              <el-button link :icon="Delete" @click="handlePendingAction(`删除标签 ${row.label}`)" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="categoryDialogVisible" title="新增分类" width="420px" @closed="resetCategoryForm">
      <div class="taxonomy-dialog__field">
        <label>名称</label>
        <el-input v-model="categoryForm.label" placeholder="例如：技术复盘" @input="syncCategorySlug" />
      </div>

      <div class="taxonomy-dialog__field">
        <label>Slug</label>
        <el-input v-model="categoryForm.slug" placeholder="例如：ji-shu-fu-pan" @input="categorySlugEdited = true" />
      </div>

      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingCategory" @click="submitCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="tagDialogVisible" title="新增标签" width="420px" @closed="resetTagForm">
      <div class="taxonomy-dialog__field">
        <label>名称</label>
        <el-input v-model="tagForm.label" placeholder="例如：JavaScript" @input="syncTagSlug" />
      </div>

      <div class="taxonomy-dialog__field">
        <label>Slug</label>
        <el-input v-model="tagForm.slug" placeholder="例如：javascript" @input="tagSlugEdited = true" />
      </div>

      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingTag" @click="submitTag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.taxonomy-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.taxonomy-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  overflow: hidden;
}

.taxonomy-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 8px;
}

.taxonomy-card__header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111111;
}

.taxonomy-card__add {
  --el-button-bg-color: #111111;
  --el-button-border-color: #111111;
  --el-button-hover-bg-color: #2c2c2c;
  --el-button-hover-border-color: #2c2c2c;
  border-radius: 12px;
}

.taxonomy-card :deep(.el-table) {
  --el-table-border-color: #e9edf2;
  --el-table-header-bg-color: #ffffff;
  --el-table-row-hover-bg-color: #fafafa;
}

.taxonomy-card :deep(.el-table th.el-table__cell) {
  color: #111111;
  font-weight: 600;
}

.taxonomy-card :deep(.el-table td.el-table__cell) {
  color: #606266;
}

.taxonomy-card__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.taxonomy-dialog__field + .taxonomy-dialog__field {
  margin-top: 16px;
}

.taxonomy-dialog__field label {
  display: block;
  margin-bottom: 8px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .taxonomy-page {
    grid-template-columns: 1fr;
  }
}
</style>
