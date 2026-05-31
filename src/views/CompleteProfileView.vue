<template>
  <div class="setup-container">
    <div class="setup-box">

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

      <!-- Steps -->
      <div class="steps">
        <div class="step done">
          <div class="step-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span>Account Created</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <div class="step-circle">2</div>
          <span>Complete Profile</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-circle">3</div>
          <span>Done!</span>
        </div>
      </div>

      <h2 class="title">Complete Your Profile</h2>
      <p class="subtitle">Add your membership details to get started</p>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="success" class="alert success">{{ success }}</div>

      <form @submit.prevent="submit" class="form">
        <div class="form-group">
          <label>Address</label>
          <input
            v-model="form.address"
            type="text"
            placeholder="e.g. Nablus, West Bank"
          />
          <span v-if="errors.address" class="field-error">{{ errors.address[0] }}</span>
        </div>

        <div class="form-group">
          <label>Phone Number</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="e.g. +970599123456"
          />
          <span v-if="errors.phone" class="field-error">{{ errors.phone[0] }}</span>
        </div>

       

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Saving...' : 'Complete Setup →' }}
        </button>

        <button type="button" class="btn-skip" @click="skip">
          Skip for now
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const success = ref('')
const errors  = ref({})

const form = ref({
  address:         '',
  phone:           '',
  membership_date: new Date().toISOString().split('T')[0],
  status:          'active',
})

// تحقق إن الـ token موجود
onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
  }
})

const submit = async () => {
  loading.value = true
  error.value   = ''
  errors.value  = {}

  try {
    // بيبعت POST /members — الـ backend بيعرف الـ user من التوكن
    await api.post('/members', {
      ...form.value,
    })

    success.value = 'Profile completed! Redirecting...'
    localStorage.setItem('profileComplete', 'true')

    setTimeout(() => router.push('/dashboard'), 1200)
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors ?? {}
      error.value  = 'Please check the fields below.'
    } else {
      error.value = e.response?.data?.message || 'Something went wrong.'
    }
  } finally {
    loading.value = false
  }
}

const skip = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.setup-container {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #f0ede8;
  font-family: 'DM Sans', sans-serif;
}

.setup-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
}

/* Brand */
.brand {
  display: flex; align-items: center; gap: 10px;
  justify-content: center; margin-bottom: 28px;
}
.brand-icon {
  width: 40px; height: 40px; background: #141414;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: #c9a96e;
}
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: #141414;
}

/* Steps */
.steps {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin-bottom: 28px;
}
.step {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; min-width: 80px;
}
.step-circle {
  width: 30px; height: 30px; border-radius: 50%;
  background: #f0f0f0; color: #aaa;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  transition: all 0.2s;
}
.step span {
  font-size: 11px; color: #aaa; text-align: center;
  white-space: nowrap;
}
.step.done .step-circle {
  background: #dcfce7; color: #16a34a;
}
.step.done span { color: #16a34a; }
.step.active .step-circle {
  background: #141414; color: white;
}
.step.active span { color: #141414; font-weight: 500; }
.step-line {
  flex: 1; height: 1px; background: #e0e0e0;
  margin-bottom: 18px; min-width: 20px;
}

/* Title */
.title {
  font-size: 20px; font-weight: 600; color: #141414;
  text-align: center; margin-bottom: 6px;
}
.subtitle {
  font-size: 13px; color: #888; text-align: center; margin-bottom: 24px;
}

/* Alerts */
.alert {
  padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;
}
.alert.error   { background: #fee2e2; color: #dc2626; }
.alert.success { background: #dcfce7; color: #16a34a; }

/* Form */
.form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #444; }
.req { color: #dc2626; }

input, select {
  width: 100%; padding: 10px 13px;
  border: 1px solid #e5e5e5; border-radius: 9px;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: #1a1a1a; outline: none; transition: border 0.15s;
  background: white;
}
input:focus, select:focus {
  border-color: #c9a96e;
  box-shadow: 0 0 0 3px rgba(201,169,110,0.1);
}
.field-error { font-size: 12px; color: #dc2626; }

.info-box {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: #f0f9ff;
  border-radius: 8px; font-size: 12px; color: #0369a1;
  border: 1px solid #bae6fd;
}

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

.btn-skip {
  width: 100%; padding: 10px;
  background: transparent; color: #888;
  border: 1px solid #e5e5e5; border-radius: 10px;
  font-size: 13px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.btn-skip:hover { background: #f5f5f5; color: #333; }
</style>