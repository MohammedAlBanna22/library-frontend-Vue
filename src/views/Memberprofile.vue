<template>
  <div class="page">
    <!-- Back Button -->
    <button class="back-btn" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading profile...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn-retry">Retry</button>
    </div>

    <!-- Profile Content -->
    <template v-else-if="member">
      <div class="profile-container">
        <!-- Header -->
        <div class="profile-header">
          <div class="profile-avatar">
            {{ initial(member.user?.name) }}
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ member.user?.name }}</h1>
            <p class="member-email">{{ member.user?.email }}</p>
            <span class="profile-status" :class="member.status">
              {{ member.status === 'active' ? '✓ Active Member' : 'Inactive' }}
            </span>
          </div>
          <div class="profile-actions">
            <button
              v-if="!isEditing"
              @click="startEditing"
              class="btn-edit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Edit Profile
            </button>
            <button
              v-else
              @click="cancelEditing"
              class="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Books Borrowed</div>
            <div class="stat-value">{{ stats.totalBorrowed }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Currently Borrowed</div>
            <div class="stat-value">{{ stats.currentlyBorrowed }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Overdue Books</div>
            <div class="stat-value" :class="{ danger: stats.overdueBooks > 0 }">{{ stats.overdueBooks }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Member Since</div>
            <div class="stat-value-date">{{ formatDate(member.membership_date) }}</div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <h2 class="section-title">Profile Information</h2>

          <!-- Alerts -->
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>
          <div v-if="submitError" class="alert alert-error">
            {{ submitError }}
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="profile-form">
            <!-- Read-only: Name & Email -->
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input
                  :value="member.user?.name"
                  type="text"
                  class="form-input"
                  disabled
                />
                <span class="form-hint">Contact admin to change name</span>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input
                  :value="member.user?.email"
                  type="email"
                  class="form-input"
                  disabled
                />
                <span class="form-hint">Contact admin to change email</span>
              </div>
            </div>

            <!-- Read-only: Membership Date & Status -->
            <div class="form-row">
              <div class="form-group">
                <label>Membership Date</label>
                <input
                  :value="formData.membership_date"
                  type="date"
                  class="form-input"
                  disabled
                />
                <span class="form-hint">Contact admin to change membership date</span>
              </div>

              <div class="form-group">
                <label>Status</label>
                <select
                  v-model="formData.status"
                  class="form-input"
                  disabled
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span class="form-hint">Only admins can change status</span>
              </div>
            </div>

            <!-- Editable: Phone & Address -->
            <div class="form-row">
              <div class="form-group">
                <label>
                  Phone Number
                  <span v-if="isEditing" class="req">*</span>
                </label>
                <input
                  v-model="formData.phone"
                  type="text"
                  class="form-input"
                  :disabled="!isEditing"
                  placeholder="Enter phone number"
                />
                <span v-if="formErrors.phone" class="form-error-small">{{ formErrors.phone[0] }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Address</label>
              <textarea
                v-model="formData.address"
                class="form-input"
                :disabled="!isEditing"
                placeholder="Enter your address..."
                rows="3"
              ></textarea>
              <span v-if="formErrors.address" class="form-error-small">{{ formErrors.address[0] }}</span>
            </div>

            <!-- Submit Buttons -->
            <div v-if="isEditing" class="form-actions">
              <button
                type="button"
                @click="cancelEditing"
                class="btn-secondary"
                :disabled="isSubmitting"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Additional Info -->
        <div class="additional-info">
          <h2 class="section-title">Account Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Member ID</span>
              <span class="info-value mono">{{ member.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">User Account</span>
              <span class="info-value">{{ member.user?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone Number</span>
              <span class="info-value">{{ member.phone || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Membership Date</span>
              <span class="info-value">{{ formatDate(member.membership_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value" :class="member.status === 'active' ? 'text-green' : 'text-red'">
                {{ member.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Toast -->
    <div class="toast" :class="{ show: toast.show, error: toast.type === 'error' }">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const member = ref(null)
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)
const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')
const formErrors = ref({})

const toast = ref({ show: false, message: '', type: 'success' })

const stats = ref({
  totalBorrowed: 0,
  currentlyBorrowed: 0,
  overdueBooks: 0
})

const formData = ref({
  address: '',
  membership_date: '',
  status: 'active',
  phone: ''
})

const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/members/me')
    member.value = res.data.data || res.data

    formData.value = {
      address: member.value.address || '',
      membership_date: member.value.membership_date || '',
      status: member.value.status || 'active',
      phone: member.value.phone || ''
    }

    // Fetch borrowing stats
    await fetchBorrowingStats()

  } catch (e) {
    console.error('Profile fetch error:', e)
    if (e.response?.status === 404) {
      error.value = 'Member profile not found. Please create one first.'
    } else {
      error.value = e.response?.data?.message || 'Failed to load profile'
    }
  } finally {
    loading.value = false
  }
}

const fetchBorrowingStats = async () => {
  try {
    const res = await api.get('/borrowings')
    const borrowings = res.data.data || res.data || []
    
    if (!Array.isArray(borrowings)) {
      console.warn('Borrowings not array')
      return
    }

    // Calculate stats exactly like Dashboard
    stats.value.totalBorrowed = borrowings.length
    stats.value.currentlyBorrowed = borrowings.filter(b => b.status === 'borrowed').length
    stats.value.overdueBooks = borrowings.filter(b => b.status === 'overdue').length
    
    console.log('✅ Stats:', stats.value)
  } catch (e) {
    console.error('Borrowing stats error:', e)
  }
}

const startEditing = () => {
  formErrors.value = {}
  successMessage.value = ''
  submitError.value = ''
  isEditing.value = true
}

const cancelEditing = () => {
  formData.value = {
    address: member.value.address || '',
    membership_date: member.value.membership_date || '',
    status: member.value.status || 'active',
    phone: member.value.phone || ''
  }
  formErrors.value = {}
  submitError.value = ''
  successMessage.value = ''
  isEditing.value = false
}

const submitForm = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  submitError.value = ''
  successMessage.value = ''

  try {
    // Only send the two editable fields
    const response = await api.patch('/members/me', {
      address: formData.value.address,
      phone: formData.value.phone,
    })

    member.value = response.data.data || response.data

    // Sync form with returned data (keep membership_date & status from original)
    formData.value = {
      address: member.value.address || '',
      membership_date: member.value.membership_date || '',
      status: member.value.status || 'active',
      phone: member.value.phone || ''
    }

    successMessage.value = 'Profile updated successfully!'
    showToast('Profile updated successfully!')
    isEditing.value = false

  } catch (e) {
    console.error('Update error:', e)

    if (e.response?.status === 422) {
      formErrors.value = e.response.data.errors || {}
      submitError.value = 'Please check the form errors'
    } else if (e.response?.status === 404) {
      submitError.value = 'Member profile not found'
    } else {
      submitError.value = e.response?.data?.message || 'Failed to update profile'
    }
  } finally {
    isSubmitting.value = false
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '—'

const initial = (n) => n ? n.charAt(0).toUpperCase() : '?'

onMounted(fetchProfile)
</script>

<style scoped>
.page {
  padding: 32px 40px;
  min-height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'DM Sans', sans-serif;
  background: #fafafa;
}

/* Back Button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  margin-bottom: 28px;
  padding: 0;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.15s;
}

.back-btn:hover {
  color: #141414;
}

/* Loading / Error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px;
  color: #aaa;
  font-size: 14px;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e8e8e8;
  border-top-color: #c9a96e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 16px;
  padding: 10px 18px;
  background: #141414;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

.btn-retry:hover { background: #2d2d2d; }

/* Profile Container */
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Profile Header */
.profile-header {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: space-between;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a96e, #a07840);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 32px;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #141414;
  margin: 0;
}

.member-email {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.profile-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
}

.profile-status.active  { background: #dcfce7; color: #16a34a; }
.profile-status.inactive { background: #fee2e2; color: #dc2626; }

.profile-actions { display: flex; gap: 8px; }

.btn-edit,
.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: #141414;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.btn-edit:hover  { background: #2d2d2d; }
.btn-cancel      { background: #f0f0f0; color: #333; }
.btn-cancel:hover { background: #e5e5e5; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label     { font-size: 12px; color: #888; font-weight: 500; }
.stat-value     { font-size: 28px; font-weight: 600; color: #141414; }
.stat-value.danger { color: #dc2626; }
.stat-value-date { font-size: 14px; color: #333; font-weight: 500; }

/* Form Section */
.form-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #141414;
  margin: 0 0 24px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #444;
}

.req { color: #dc2626; }

.form-input {
  border: 1px solid #e5e5e5;
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
  background: white;
}

.form-input:disabled {
  background: #f8f8f8;
  color: #999;
  cursor: not-allowed;
}

.form-input:focus:not(:disabled) {
  border-color: #c9a96e;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1);
}

textarea.form-input {
  resize: vertical;
  font-family: 'DM Sans', sans-serif;
}

.form-error-small {
  color: #dc2626;
  font-size: 12px;
  margin-top: 2px;
  display: block;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn-primary {
  background: #141414;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) { background: #2d2d2d; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) { background: #e5e5e5; }
.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 9px;
  font-size: 13px;
  margin-bottom: 16px;
}

.alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.alert-error   { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }

/* Additional Info */
.additional-info {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label { font-size: 12px; color: #888; font-weight: 500; }
.info-value { font-size: 14px; color: #333; font-weight: 500; }
.info-value.mono { font-family: monospace; font-size: 12px; }
.text-green { color: #16a34a !important; }
.text-red   { color: #dc2626 !important; }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #141414;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 13px;
  transform: translateY(80px);
  opacity: 0;
  transition: all 0.3s;
  z-index: 200;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.toast.show  { transform: translateY(0); opacity: 1; }
.toast.error { background: #dc2626; }

/* Responsive */
@media (max-width: 768px) {
  .page { padding: 20px; }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .profile-actions {
    width: 100%;
    justify-content: center;
  }

  .form-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .info-grid { grid-template-columns: 1fr; }
}
</style>