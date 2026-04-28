<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Search, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { deleteArticle } from '@/servers/article'
import { useArticles } from '@/composables/useArticles'

const router = useRouter()
const { articles, isLoading, error, setArticles } = useArticles()
const { loadTaxonomies } = useTaxonomies()

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 8

const filteredArticles = computed(() => {
  //规范关键词
  const normalizedKeyword = keyword.value.trim().toLowerCase()
//对article进行过滤
  return articles.value.filter((article) => {
    if (!normalizedKeyword) {
      return true
    }

    return [article.title, article.category, article.slug, ...article.tags]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword)
  })
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize).map((article, index) => {
    const views = 700 + (filteredArticles.value.length - start - index) * 111
    const comments = Math.max(2, article.tags.length * 3 + index)

    return {
      ...article,
      tableId: start + index + 1,
      viewCount: views.toLocaleString(),
      commentCount: comments,
      statusLabel: '已发布',
      publishTime: article.createdAt.replace('T', ' ').slice(0, 16),
    }
  })
})

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}


const handleEdit = (id: string) => {
  router.push(`/admin/article/${id}/edit`)
}

const handleDelete = async (id: string, title: string) => {
  try {
    await ElMessageBox.confirm(`确认删除《${title}》吗？`, '删除文章', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteArticle(id)
    setArticles(articles.value.filter((item) => item._id !== id))
    await loadTaxonomies()
    ElMessage.success('文章删除成功')
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }

    ElMessage.error(error?.response?.data?.message || '文章删除失败')
  }
}
</script>

<template>
  <div class="article-page">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索文章标题或分类..."
        clearable
        class="search-input"
        :prefix-icon="Search"
        @input="handleSearch"
      />

      <el-button type="primary" class="toolbar-create" :icon="Plus" @click="router.push('/admin/article/new')">
        新建文章
      </el-button>
    </div>

    <!-- 搜索文章逻辑页面 -->
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <div v-else class="table-wrap" v-loading="isLoading">
      <el-table :data="paginatedArticles" row-key="_id" empty-text="当前没有符合条件的文章。">
        <el-table-column prop="tableId" label="ID" width="60" />

        <el-table-column label="标题" min-width="420" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.title }}
          </template>
        </el-table-column>

        <el-table-column label="分类" width="110" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" class="article-tag">{{ row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" />
        <el-table-column prop="commentCount" label="评论数" width="90" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="publishTime" label="发布时间" width="170" align="center" />

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
              <div class="row-actions">
              <el-button link :icon="Edit" @click="handleEdit(row._id)" />
              <el-button link :icon="Delete" @click="handleDelete(row._id, row.title)" />
             </div>
           </template>
         </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap">
      <div class="pagination-wrap__summary">
        共 {{ filteredArticles.length }} 条，第 {{ currentPage }}/{{ Math.max(1, Math.ceil(filteredArticles.length / pageSize)) }} 页
      </div>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="filteredArticles.length"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.article-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-input {
  max-width: 480px;
}

.toolbar-create {
  --el-button-bg-color: #111111;
  --el-button-border-color: #111111;
  --el-button-hover-bg-color: #2c2c2c;
  --el-button-hover-border-color: #2c2c2c;
  border-radius: 12px;
}

.table-wrap {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.table-wrap :deep(.el-table) {
  --el-table-header-bg-color: transparent;
  --el-table-border-color: #edf2f7;
  --el-table-row-hover-bg-color: #f7fbff;
}

.table-wrap :deep(.el-table th.el-table__cell) {
  color: #111111;
  font-weight: 600;
}

.table-wrap :deep(.el-table td.el-table__cell) {
  color: #303133;
}

.article-tag {
  color: #606266;
  border-color: #e4e7ed;
  background: #f5f7fa;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.row-actions :deep(.el-button) {
  color: #606266;
}

.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #606266;
}

.pagination-wrap :deep(.btn-next),
.pagination-wrap :deep(.btn-prev),
.pagination-wrap :deep(.number) {
  border-radius: 12px;
}

.pagination-wrap :deep(.number.is-active) {
  background: #111111;
  color: #ffffff;
}

@media (max-width: 960px) {
  .toolbar,
  .pagination-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }
}
</style>
