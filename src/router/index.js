import { createRouter, createWebHistory } from 'vue-router'
import { isMobileDevice } from '@/utils/device'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () =>
        isMobileDevice()
          ? import('@mobile/HomeView.vue')
          : import('@web/HomeView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
