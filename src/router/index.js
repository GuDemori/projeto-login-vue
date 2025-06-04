import { createRouter, createWebHistory } from 'vue-router'
import LoginLayout from '../components/LoginLayout.vue'
import Welcome from '../components/Welcome.vue'

const routes = [
    { path: '/', component: LoginLayout },
    { path: '/welcome', component: Welcome }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
