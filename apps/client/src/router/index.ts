import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { AxiosError } from 'axios'
import type { ApiResult } from '@/types/http'
import { ElMessage } from 'element-plus'
import HomeView from '@/views/homeView/index.vue'
import { siteConfig } from '@/config/site'
import { useAuth } from '@/composables/useAuth'
import { refreshAccessToken } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/layouts/AdminLayout.vue'),
    meta: {
      appShell: 'admin',
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/adminDashboardView/index.vue'),
        meta: {
          appShell: 'admin',
          title: '仪表盘',
          description: '查看内容概览、最近文章和后台快捷入口',
        },
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: () => import('@/views/admin/AdminArticlesView.vue'),
        meta: {
          appShell: 'admin',
          title: '文章管理',
          description: '浏览已有文章，快速筛选并跳转前台查看',
        },
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/AdminCategoriesView.vue'),
        meta: {
          appShell: 'admin',
          title: '分类管理',
          description: '管理分类与标签结构',
        },
      },
      {
        path: 'messages',
        name: 'admin-messages',
        component: () => import('@/views/admin/AdminMessagesView.vue'),
        meta: {
          appShell: 'admin',
          title: '留言管理',
          description: '审核、拒绝和删除前台留言',
        },
      },
      {
        path: 'article/new',
        name: 'admin-article-new',
        component: () => import('@/views/admin/AdminArticleNewView.vue'),
        meta: {
          appShell: 'admin',
          title: '新建文章',
          description: '填写必要字段并发布 Markdown 文章',
        },
      },
      {
        path: 'article/:id/edit',
        name: 'admin-article-edit',
        component: () => import('@/views/admin/AdminArticleNewView.vue'),
        meta: {
          appShell: 'admin',
          title: '编辑文章',
          description: '更新文章内容并重新发布',
        },
      },
    ],
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('@/views/BlogView.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/ArchiveView.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/category/:slug',
    name: 'category',
    component: () => import('@/views/CategoryView.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/tag/:tag',
    name: 'tag',
    component: () => import('@/views/TagView.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/message',
    name: 'message',
    component: () => import('@/views/MessageView.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/aboutView/index.vue'),
    meta: {
      headerStyle: 'overlay',
    },
  },
  {
    path: '/article/:slug',
    name: 'article',
    component: () => import('@/views/postView/index.vue'),
    meta: {
      headerStyle: 'overlay',
      disablePageTransition: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.path.startsWith('/admin') || to.path === '/login') {
    const metaTitle = typeof to.meta.title === 'string' ? to.meta.title : ''
    document.title = metaTitle ? `${metaTitle} - ${siteConfig.name}` : `${siteConfig.name} Admin`
  }
})

router.beforeEach(async (to) => {
  const { isAccessTokenExpired } = useAuth()
  const token = localStorage.getItem('local-token')
  const isAdminRoute = to.path.startsWith('/admin')
  const isLoginRoute = to.path === '/login'

  if (!isAdminRoute) {
    if (isLoginRoute && token && !isAccessTokenExpired(token)) {
      return '/admin'
    }
    return true
  }

  if (!token) {
    return '/login'
  }

  if (!isAccessTokenExpired(token)) {
    return true
  }

  try {
    const result = await refreshAccessToken()
    const newToken = result.data.accessToken
    localStorage.setItem('local-token', newToken)
    return true
  } catch (refreshError) {
    const status = (refreshError as AxiosError<ApiResult<unknown>>).response?.status
    //只有刷新接口确认返回401（长token真正失效）才判定登录失效
    if (status === 401) {
      localStorage.removeItem('local-token')
      ElMessage.warning('登录状态已过期，请重新登录')
      return '/login'
    }
    //网络、限流或服务端临时错误：保留登录态，取消本次导航
    ElMessage.warning('网络异常，请稍后重试')
    return false
  }
})

export default router
