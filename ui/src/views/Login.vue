<template>
    <div class="login-container">
        <h2>Login</h2>
        <button @click="login" class="login-button">Duke OAuth2</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()



function login() {
    // Perform login logic here, e.g., redirect to login page
    window.location.href = '/api/login';
}
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.login-button {
    padding: 10px 20px;
    margin-top: 20px;
    font-size: 1rem;
    cursor: pointer;
}
</style>