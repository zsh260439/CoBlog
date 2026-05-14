import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/homeView/index.vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/composables/useAuth'
import { refreshAccessToken } from '@/utils/auth'
import { siteConfig } from '@/config/site'
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
        component: () => import('@/views/admin/adminDashboardView/index.vue'),
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
        path: 'messages',
        name: 'admin-messages',
        component: () => import('@/views/admin/AdminMessagesView.vue'),
        meta: {
          appShell: 'admin',
          title: '留言管理',
          description: '审核、拒绝和删除前台留言'
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
    component: () => import('@/views/aboutView/index.vue'),
    meta: {
      headerStyle: 'overlay'
    }
  },
  {
    path: '/article/:slug',
    name: 'article',
    component: () => import('@/views/postView/index.vue'),
    meta: {
      headerStyle: 'overlay',
      disablePageTransition: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (to.path.startsWith('/admin') || to.path === '/login') {
    const metaTitle = typeof to.meta.title === 'string' ? to.meta.title : ''
    document.title = metaTitle ? `${metaTitle} - ${siteConfig.name}` : `${siteConfig.name} Admin`
  }
})
// 只有后台路由需要 token；公开页面直接放行，后台页面在这里统一处理刷新。
router.beforeEach(async (to) =>{
  const {isAccessTokenExpired} = useAuth()
    //首先检查token是否存在
    const token = localStorage.getItem('local-token')
    const isAdminRoute = to.path.startsWith('/admin')
    const isLoginRoute = to.path === '/login'
    //首先放行公开页面
    if(!isAdminRoute) {
      //如果去登录页 token还有效 回后台
      if(isLoginRoute && token && !isAccessTokenExpired(token))
        {
         return '/admin'
      }
      return true
   }
   //如果在后台 没token
   if(!token) {
    return '/login'
   }

   //token没过期 放行
    if(!isAccessTokenExpired(token)){
       return true
    } 
     //token过期 尝试refresh
           try {
            const result = await refreshAccessToken()
            const newToken = result.data.accessToken
           localStorage.setItem('local-token',newToken)
         return true
          } catch {
           localStorage.removeItem('local-token')
           ElMessage.warning('登录状态过期,请重新登录!')
           return '/login'
         }
      }
  )
export default router
