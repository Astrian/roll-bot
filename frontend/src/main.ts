import { createApp } from 'vue'
import './style.scss'
import 'bulma'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUpload, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Admin.vue')},
    { path: '/raffles/:id', component: () => import('./pages/Raffles.vue')}
  ]
})

library.add(faUpload)
library.add(faAngleDown)

createApp(RouterView).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
