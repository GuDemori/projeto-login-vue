import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'top-right',
    theme: 'colored'
})


app.mount('#app')