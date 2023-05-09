import { createApp } from 'vue'
import './style.scss'
import 'bulma'
import { createRouter, createWebHistory, RouterView } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    
    { path: '/raffles/:id', component: () => import('./pages/Raffles.vue')}
  ]
})

createApp(RouterView).use(router).mount('#app')
