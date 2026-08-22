import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/play/:groupId/results',
      name: 'results',
      component: () => import('@/views/ResultsView.vue'),
      props: true,
    },
    {
      path: '/play/:groupId',
      name: 'play',
      component: () => import('@/views/PlayView.vue'),
      props: true,
    },
    { path: '/learn', redirect: { name: 'home' } },
    { path: '/learn/:pathMatch(.*)*', redirect: { name: 'home' } },
    { path: '/quiz', redirect: { name: 'home' } },
    { path: '/quiz/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
