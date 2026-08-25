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
      path: '/course/:courseId/results',
      name: 'results',
      component: () => import('@/views/ResultsView.vue'),
      props: true,
    },
    {
      path: '/course/:courseId',
      name: 'course',
      component: () => import('@/views/CourseView.vue'),
      props: true,
    },
    { path: '/play/:courseId/results', redirect: (to) => ({ name: 'results', params: to.params }) },
    { path: '/play/:courseId', redirect: (to) => ({ name: 'course', params: to.params }) },
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
