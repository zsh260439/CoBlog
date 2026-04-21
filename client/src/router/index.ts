import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path:'/login',
    name:'login',
    component:() => import('@/views/Login.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/layouts/AdminLayout.vue'),
    meta: {
      appShell: 'admin'
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        meta: {
          appShell: 'admin',
          title: '仪表盘',
          description: '查看内容概览、最近文章和后台快捷入口'
        }
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: () => import('@/views/admin/AdminArticlesView.vue'),
        meta: {
          appShell: 'admin',
          title: '文章管理',
          description: '浏览已有文章，快速筛选并跳转前台查看'
        }
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/AdminCategoriesView.vue'),
        meta: {
          appShell: 'admin',
          title: '分类管理',
          description: '管理分类与标签结构'
        }
      },
      {
        path: 'article/new',
        name: 'admin-article-new',
        component: () => import('@/views/admin/AdminArticleNewView.vue'),
        meta: {
          appShell: 'admin',
          title: '新建文章',
          description: '填写必要字段并发布 Markdown 文章'
        }
      },
      {
        path: 'article/:id/edit',
        name: 'admin-article-edit',
        component: () => import('@/views/admin/AdminArticleNewView.vue'),
        meta: {
          appShell: 'admin',
          title: '编辑文章',
          description: '更新文章内容并重新发布'
        }
      }
    ]
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('@/views/BlogView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/ArchiveView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/category/:slug',
    name: 'category',
    component: () => import('@/views/CategoryView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/tag/:tag',
    name: 'tag',
    component: () => import('@/views/TagView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/message',
    name: 'message',
    component: () => import('@/views/MessageView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/article/:slug',
    name: 'article',
    component: () => import('@/views/PostView.vue'),
    meta: {
      headerStyle: 'overlay',
      disablePageTransition: true
    }
  },
  {
    path: '/post/:id',
    redirect: { name: 'blog' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to)=>{
   const token = localStorage.getItem('local-token')
   const isAdminRoute = to.path.startsWith('/admin')
   const isLoginRoute = to.path === '/login'
   if(isAdminRoute && !token) return '/login'
   if(isLoginRoute && token) return '/admin'
})
export default router
