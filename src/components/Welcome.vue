<template>
    <div class="welcome-container">
        <h1>Seja bem-vindo(a), {{ email }}!</h1>
        <p>Seu token expira em: <strong>{{ expiration }}</strong></p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const expiration = ref('')

onMounted(() => {
    const token = localStorage.getItem('token')
    if (!token) {
        router.push('/')
        return
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        email.value = payload.email || 'usuário desconhecido'
        expiration.value = new Date(payload.exp * 1000).toLocaleString()
    } catch (e) {
        console.error('Token inválido', e)
        router.push('/')
    }
})
</script>

<style scoped>
.welcome-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
}
</style>