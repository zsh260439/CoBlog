<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { useArticles } from '@/composables/useArticles'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { createSlugFromText } from '@/utils'
import type { AdminTaxonomyForm } from '@/types/admin'
import type { ArticleCategory } from '@/types/article'
import { deleteCategory, updateCategory, deleteTag, updateTag } from '@/servers/taxonomy'
const { categories, tags, isLoading, loadTaxonomies, createCategoryItem, createTagItem } = useTaxonomies()
const { loadArticles } = useArticles()

const categoryDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const submittingCategory = ref(false)
const submittingTag = ref(false)
const tagSlugEdited = ref(false)
const categorySlugEdited = ref(false)
const preCategorySlug = ref('')
const preTagSlug = ref('')
const categoryForm = reactive<AdminTaxonomyForm>({
  label: '',
  slug: '',
})

const tagForm = reactive<AdminTaxonomyForm>({
  label: '',
  slug: '',
})

const resetCategoryForm = () => {
  preCategorySlug.value = ''
  categoryForm.label = ''
  categoryForm.slug = ''
  categorySlugEdited.value = false
}

const resetTagForm = () => {
  preTagSlug.value = ''
  tagForm.label = ''
  tagForm.slug = ''
  tagSlugEdited.value = false
}

const syncCategorySlug = () => {
    categoryForm.slug = createSlugFromText(categoryForm.label, 32)
}
const syncTagSlug = () => {
    tagForm.slug = createSlugFromText(tagForm.label, 32)
}

// 分类和标签弹窗共用同一套流程：先校验，再根据 isEdit 决定走新增还是更新。
const submitCategory = async (isEdit: boolean,preCategorySlug:string) => {
   if (!categoryForm.label.trim() || !categoryForm.slug.trim()) {
    ElMessage.warning('请先填写完整的分类名称和 slug')
    return
  }
  submittingCategory.value = true
  //如果是编辑模式 走这里
  if (isEdit) {
    try {
      await updateCategory(preCategorySlug.trim(),{
        label: categoryForm.label.trim(),
        slug: categoryForm.slug.trim(),
      })
      ElMessage.success('分类编辑成功')
      //关闭弹窗
      categoryDialogVisible.value = false
      //重置form表单
      resetCategoryForm()
    } catch {
      ElMessage.error('分类编辑失败')
    } finally {
      submittingCategory.value = false
      categorySlugEdited.value = false
      await Promise.all([loadTaxonomies(), loadArticles()])
    }
  }else{
    try {
      await createCategoryItem({
        label: categoryForm.label.trim(),
        slug: categoryForm.slug.trim(),
      })
      ElMessage.success('分类新增成功')
      categoryDialogVisible.value = false
      resetCategoryForm()
    } catch {
      ElMessage.error('分类新增失败')
    } finally {
      submittingCategory.value = false
      //更新页面
      await Promise.all([loadTaxonomies(), loadArticles()])
    }
  }
}

const submitTag = async (isEdit: boolean,preTagSlug:string) => {
  if (!tagForm.label.trim() || !tagForm.slug.trim()) {
    ElMessage.warning('请先填写完整的标签名称和 slug')
    return
  }

  submittingTag.value = true

  try {
    if (isEdit) {
      await updateTag(preTagSlug.trim(),{
        label: tagForm.label.trim(),
        slug: tagForm.slug.trim(),
      })
      ElMessage.success('标签编辑成功')
      tagDialogVisible.value = false
      resetTagForm()
    }else{
      await createTagItem({
        label: tagForm.label.trim(),
        slug: tagForm.slug.trim(),
      })
      ElMessage.success('标签新增成功')
      tagDialogVisible.value = false
      resetTagForm()
    }
  } catch {
    ElMessage.error(isEdit ? '标签编辑失败' : '标签新增失败')
  } finally {
    submittingTag.value = false
    //无论是否成功 都需要将 tagSlugEdited 重置为 false
    tagSlugEdited.value = false
    //更新页面
    await Promise.all([loadTaxonomies(), loadArticles()])
  } 
}
//编辑标签 首先回填原有数据 但是这个时候因为共用一个弹窗 所以需要判断是否是编辑操作 如果是编辑操作 则需要将弹窗标题改为编辑标签
const handleEditTag = async (row: ArticleCategory) => {
   preTagSlug.value = row.slug
   //回填
   tagForm.label = row.label
   tagForm.slug = row.slug
   tagDialogVisible.value = true
}
//编辑分类 首先回填原有数据 但是这个时候因为共用一个弹窗 所以需要判断是否是编辑操作 如果是编辑操作 则需要将弹窗标题改为编辑分类
const handleEditCategory = async (row: ArticleCategory) => {
   preCategorySlug.value = row.slug
   //回填
   categoryForm.label = row.label
   categoryForm.slug = row.slug
   categorySlugEdited.value = true
}
//删除分类
const handleDeleteCategory = async (slug: string) => {
  //当我点击进来 必须要询问确认删除 因为删除分类包含全部文章
  try {
    await ElMessageBox.confirm('确认删除分类吗？这会删除该分类下的所有文章!', '删除分类', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteCategory(slug)
    ElMessage.success('分类删除成功')
    await Promise.all([loadTaxonomies(), loadArticles()])
  } catch {
    ElMessage.error('分类删除失败')
  }
}
//删除标签
const handleDeleteTag = async (slug: string) => {
  try {
    await ElMessageBox.confirm('确认删除这类标签吗？', '删除标签', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTag(slug)
    ElMessage.success('标签删除成功')
    await Promise.all([loadTaxonomies(), loadArticles()])
  } catch {
    ElMessage.error('标签删除失败')
  }
}
onMounted(() => {
  void loadTaxonomies()
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
              <el-button link :icon="Edit" @click="()=>{categoryDialogVisible = true,handleEditCategory(row)}" />
              <el-button link :icon="Delete" @click="handleDeleteCategory(row.slug)" />
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
              <el-button link :icon="Edit" @click="()=>{tagSlugEdited = true,handleEditTag(row)}" />
              <el-button link :icon="Delete" @click="handleDeleteTag(row.slug)" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="categoryDialogVisible" :title="categorySlugEdited ? '编辑分类' : '新增分类'" width="420px" @closed="resetCategoryForm">
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
        <el-button type="primary" :loading="submittingCategory" @click="submitCategory(categorySlugEdited,preCategorySlug)">保存</el-button>
      </template>
    </el-dialog>
    <!-- 标签弹窗 -->
    <el-dialog v-model="tagDialogVisible" :title="tagSlugEdited ? '编辑标签' : '新增标签'" width="420px" @closed="resetTagForm">
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
        <el-button type="primary" :loading="submittingTag" @click="submitTag(tagSlugEdited,preTagSlug)">保存</el-button>
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

.taxonomy-dialog__field+.taxonomy-dialog__field {
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
