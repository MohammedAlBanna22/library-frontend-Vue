<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Library Management</h2>
      <p>تسجيل الدخول</p>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="login">
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input v-model="form.email" type="email" placeholder="example@email.com" required />
        </div>

        <div class="field">
          <label>كلمة المرور</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'جاري الدخول...' : 'دخول' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const error = ref('')
const loading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/auth/login', form.value)
    localStorage.setItem('token', res.data.token)
    router.push('/dashboard')
  } catch (e) {
    error.value = 'البريد أو كلمة المرور غلط'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.login-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
h2 { margin: 0 0 4px; color: #1a1a1a; }
p { color: #666; margin: 0 0 1.5rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 13px; color: #444; margin-bottom: 4px; }
input {
  width: 100%; padding: 10px 12px;
  border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; box-sizing: border-box;
}
input:focus { outline: none; border-color: #4f46e5; }
button {
  width: 100%; padding: 11px;
  background: #4f46e5; color: white;
  border: none; border-radius: 8px;
  font-size: 15px; cursor: pointer; margin-top: 8px;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error {
  background: #fee2e2; color: #dc2626;
  padding: 8px 12px; border-radius: 6px;
  font-size: 13px; margin-bottom: 1rem;
}
</style>