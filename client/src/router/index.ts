import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { findArticleById } from '@/mocks/articles'
import HomeView from '@/views/HomeView.vue'

const routes: RouteRecordRaw[] = [
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
    redirect: (to) => {
      const article = findArticleById(String(to.params.id ?? ''))

      if (!article) {
        return { name: 'blog' }
      }

      return {
        name: 'article',
        params: {
          slug: article.slug
        }
      }
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

export default router
