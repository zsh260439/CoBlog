import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/post/:id',
      name: 'post',
      component: () => import('@/views/PostView.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
