<template>
  <div class="auth-container">
    <div class="auth-box">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="brand-name">Librari</span>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: view === 'login' }" @click="view = 'login'">Login</button>
        <button class="tab" :class="{ active: view === 'register' }" @click="view = 'register'">Register</button>
      </div>

      <!-- Error / Success -->
      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="success" class="alert success">{{ success }}</div>

      <!-- LOGIN -->
      <form v-if="view === 'login'" @submit.prevent="login" class="form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="loginForm.email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label>
            Password
            <button type="button" class="forgot-link" @click="view = 'forgot'">Forgot password?</button>
          </label>
          <div class="input-wrap">
            <input v-model="loginForm.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="eye-btn" @click="showPass = !showPass">
              <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- REGISTER -->
      <form v-else-if="view === 'register'" @submit.prevent="register" class="form">
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="registerForm.name" type="text" placeholder="Mohammed Ali" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="registerForm.email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <input v-model="registerForm.password" :type="showPass ? 'text' : 'password'" placeholder="Min 8 characters" required />
            <button type="button" class="eye-btn" @click="showPass = !showPass">
              <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input v-model="registerForm.password_confirmation" :type="showPass ? 'text' : 'password'" placeholder="Repeat password" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <!-- FORGOT PASSWORD -->
      <form v-else-if="view === 'forgot'" @submit.prevent="forgotPassword" class="form">
        <p class="forgot-desc">Enter your email and we'll send you a reset link.</p>
        <div class="form-group">
          <label>Email</label>
          <input v-model="forgotEmail" type="email" placeholder="you@example.com" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
        <button type="button" class="btn-back" @click="view = 'login'">← Back to Login</button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router  = useRouter()
const view    = ref('login')
const loading = ref(false)
const error   = ref('')
const success  = ref('')
const showPass = ref(false)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '', password_confirmation: '' })
const forgotEmail = ref('')

const clearMessages = () => { error.value = ''; success.value = '' }

const login = async () => {
  clearMessages(); loading.value = true
  try {
    const res = await api.post('/auth/login', loginForm.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userName', res.data.user?.name || 'Admin')
    localStorage.setItem('userRole', res.data.user?.role || 'member')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Invalid email or password'
  } finally { loading.value = false }
}

const register = async () => {
  clearMessages(); loading.value = true
  if (registerForm.value.password !== registerForm.value.password_confirmation) {
    error.value = 'Passwords do not match'; loading.value = false; return
  }
  try {
    const res = await api.post('/auth/register', registerForm.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userName', res.data.user?.name || 'Admin')
    router.push('/complete-profile')
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors) {
      error.value = Object.values(errors).flat().join(' ')
    } else {
      error.value = e.response?.data?.message || 'Registration failed'
    }
  } finally { loading.value = false }
}

const forgotPassword = async () => {
  clearMessages(); loading.value = true
  try {
    await api.post('/auth/forgot-password', { email: forgotEmail.value })
    success.value = 'Reset link sent! Check your email.'
    forgotEmail.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to send reset link'
  } finally { loading.value = false }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0ede8;
  font-family: 'DM Sans', sans-serif;
}

.auth-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
}

.brand {
  display: flex; align-items: center; gap: 10px;
  justify-content: center; margin-bottom: 28px;
}
.brand-icon {
  width: 40px; height: 40px; background: #141414;
  border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #c9a96e;
}
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: #141414;
}

.tabs {
  display: flex; background: #f5f5f5; border-radius: 10px;
  padding: 4px; margin-bottom: 24px; gap: 4px;
}
.tab {
  flex: 1; padding: 9px; border: none; background: transparent;
  border-radius: 8px; font-size: 13px; font-weight: 500;
  color: #888; cursor: pointer; transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.tab.active { background: white; color: #141414; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.alert {
  padding: 10px 14px; border-radius: 8px; font-size: 13px;
  margin-bottom: 16px;
}
.alert.error   { background: #fee2e2; color: #dc2626; }
.alert.success { background: #dcfce7; color: #16a34a; }

.form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-size: 13px; font-weight: 500; color: #444;
  display: flex; align-items: center; justify-content: space-between;
}

.input-wrap { position: relative; }
.input-wrap input { padding-right: 40px !important; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #999;
  display: flex; align-items: center;
}

input {
  width: 100%; padding: 10px 13px;
  border: 1px solid #e5e5e5; border-radius: 9px;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: #1a1a1a; outline: none; transition: border 0.15s;
}
input:focus { border-color: #c9a96e; box-shadow: 0 0 0 3px rgba(201,169,110,0.1); }

.forgot-link {
  background: none; border: none; font-size: 12px;
  color: #c9a96e; cursor: pointer; font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}
.forgot-link:hover { text-decoration: underline; }

.forgot-desc { font-size: 13px; color: #666; line-height: 1.5; }

.btn-submit {
  width: 100%; padding: 12px;
  background: #141414; color: white;
  border: none; border-radius: 10px;
  font-size: 14px; font-weight: 500;
  cursor: pointer; margin-top: 4px;
  font-family: 'DM Sans', sans-serif;
  transition: opacity 0.15s;
}
.btn-submit:hover:not(:disabled) { opacity: 0.85; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-back {
  width: 100%; padding: 10px;
  background: transparent; color: #888;
  border: 1px solid #e5e5e5; border-radius: 10px;
  font-size: 13px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.btn-back:hover { background: #f5f5f5; color: #333; }
</style>