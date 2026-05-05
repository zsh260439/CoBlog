<script setup lang="ts">
defineOptions({
  name: 'AdminLayout'
})

import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftBold,
  ChatDotRound,
  CollectionTag,
  DataBoard,
  Document,
  EditPen,
  Fold,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'
import { siteConfig } from '@/config/site'
import { logout } from '@/servers/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)

const navItems = [
  { to: '/admin', label: '仪表盘', icon: DataBoard },
  { to: '/admin/articles', label: '文章管理', icon: Document },
  { to: '/admin/categories', label: '分类管理', icon: CollectionTag },
  { to: '/admin/messages', label: '留言管理', icon: ChatDotRound },
  { to: '/admin/article/new', label: '新建文章', icon: EditPen },
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/admin/article/new')) {
    return '/admin/article/new'
  }

  if (route.path.startsWith('/admin/articles')) {
    return '/admin/articles'
  }

  if (route.path.startsWith('/admin/categories')) {
    return '/admin/categories'
  }

  if (route.path.startsWith('/admin/messages')) {
    return '/admin/messages'
  }

  return '/admin'
})

const pageTitle = computed(() => String(route.meta.title ?? '仪表盘'))

const backToSite = () => {
  router.push('/blog')
}

const handleLogout = async () => {
  try {
    await logout()
  } catch {
    // 忽略 logout API 错误
  }
  localStorage.removeItem('local-token')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside :class="['sidebar', { collapsed }]">
      <div class="sidebar-logo">
        <span v-if="!collapsed" class="logo-text">管理控制台</span>
        <span v-else class="logo-icon">
          <el-icon><DataBoard /></el-icon>
        </span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: activeMenu === item.to }]"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="collapse-btn" @click="collapsed = !collapsed">
        <el-icon>
          <Fold v-if="!collapsed" />
          <ArrowLeftBold v-else />
        </el-icon>
      </button>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="topbar-right">
          <span class="user-name">
            <el-icon><User /></el-icon>
            {{ siteConfig.ownerName }}
          </span>

          <el-button plain size="small" @click="backToSite">返回前台</el-button>

          <el-button type="danger" plain size="small" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </header>

      <main class="page-main">
        <RouterView v-slot="{ Component }">
          <keep-alive>
            <component v-if="route.meta.title === '新建文章'" :is="Component"/>
          </keep-alive>
            <component v-if="route.meta.title !== '新建文章'" :is="Component"/>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 220px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
}

.logo-icon {
  display: inline-flex;
  font-size: 20px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.nav-item.active {
  background-color: #f5f7fa;
  color: #000000;
  font-weight: 600;
}

.nav-item .el-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-top: 1px solid #e4e7ed;
  background: transparent;
  cursor: pointer;
  color: #909399;
  transition: color 0.15s;
}

.collapse-btn:hover {
  color: #303133;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.page-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}


.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 960px) {
  .admin-shell {
    display: block;
  }

  .sidebar {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
}

@media (max-width: 640px) {
  .topbar {
    height: auto;
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .topbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .page-main {
    padding: 16px;
  }
}
</style>
