
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../HomeView.vue'
import AdminView from '../AdminView.vue'
import LoginView from '../LoginView.vue'
import ClaimView from '../ClaimView.vue' // <-- Importez le composant ClaimView

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/admin',
      component: AdminView
    },
    {
      path: '/login',
      component: LoginView
    }, {
      path: '/claim/:id',
      name: 'claim',
      component: ClaimView
    }
  ]
})

export default router
