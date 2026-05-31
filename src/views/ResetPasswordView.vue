<template>
  <div class="auth-container">
    <div class="auth-box">

      <div class="brand">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="brand-name">Librari</span>
      </div>

      <h2 class="title">Reset Password</h2>
      <p class="subtitle">Enter your new password below</p>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="success" class="alert success">{{ success }}</div>

      <form v-if="!success" @submit.prevent="resetPassword" class="form">
        <div class="form-group">
          <label>New Password</label>
          <input v-model="form.password" type="password" placeholder="Min 8 characters" required />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" placeholder="Repeat password" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <RouterLink v-if="success" to="/login" class="btn-submit" style="text-align:center;display:block;text-decoration:none;margin-top:16px">
        Go to Login
      </RouterLink>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route  = useRoute()
const router = useRouter()

const loading = ref(false)
const error   = ref('')
const success = ref('')

const form = ref({
  token: '',
  email: '',
  password: '',
  password_confirmation: ''
})

onMounted(() => {
  // يقرأ token و email من الـ URL تلقائياً
  form.value.token = route.query.token || ''
  form.value.email = route.query.email || ''

  if (!form.value.token || !form.value.email) {
    error.value = 'Invalid reset link. Please request a new one.'
  }
})

const resetPassword = async () => {
  error.value = ''; loading.value = true

  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match'
    loading.value = false; return
  }

  try {
    await api.post('/auth/reset-password', form.value)
    success.value = 'Password reset successfully!'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors) {
      error.value = Object.values(errors).flat().join(' ')
    } else {
      error.value = e.response?.data?.message || 'Failed to reset password'
    }
  } finally { loading.value = false }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0ede8; font-family: 'DM Sans', sans-serif; }
.auth-box { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
.brand { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 24px; }
.brand-icon { width: 40px; height: 40px; background: #141414; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #c9a96e; }
.brand-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #141414; }
.title { font-size: 20px; font-weight: 600; color: #141414; text-align: center; margin-bottom: 6px; }
.subtitle { font-size: 13px; color: #888; text-align: center; margin-bottom: 24px; }
.alert { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.alert.error { background: #fee2e2; color: #dc2626; }
.alert.success { background: #dcfce7; color: #16a34a; }
.form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #444; }
input { width: 100%; padding: 10px 13px; border: 1px solid #e5e5e5; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; outline: none; transition: border 0.15s; }
input:focus { border-color: #c9a96e; box-shadow: 0 0 0 3px rgba(201,169,110,0.1); }
.btn-submit { width: 100%; padding: 12px; background: #141414; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 4px; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; }
.btn-submit:hover:not(:disabled) { opacity: 0.85; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>