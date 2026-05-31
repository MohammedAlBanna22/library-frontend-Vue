<template>
  <div class="page">

    <!-- Back -->
    <button class="back-btn" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Books
    </button>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading book details...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="book">

      <!-- Hero -->
      <div class="hero">
        <!-- Left: Cover -->
        <div class="hero-cover-wrap">
          <div class="cover-shadow">
            <img :src="book.cover_image" :alt="book.title" class="cover-img" />
          </div>
          <div class="avail-pill" :class="book.is_available ? 'avail' : 'unavail'">
            <span class="avail-dot"></span>
            {{ book.is_available ? 'Available' : 'Unavailable' }}
          </div>
        </div>

        <!-- Right: Info -->
        <div class="hero-info">
          <div class="genre-row">
            <span class="genre-chip">{{ book.genre }}</span>
            <span class="status-chip" :class="book.status">{{ book.status }}</span>
          </div>

          <h1 class="book-title">{{ book.title }}</h1>

          <div class="author-strip" v-if="book.author">
            <div class="author-ava">{{ initial(book.author.name) }}</div>
            <div class="author-text">
              <span class="author-name">{{ book.author.name }}</span>
              <span class="author-nat">{{ book.author.nationality }}</span>
            </div>
          </div>

          <p class="description">{{ book.description }}</p>

          <!-- Stats row -->
          <div class="stats-row">
            <div class="stat-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>{{ book.isbn }}</span>
            </div>
            <div class="stat-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ formatDate(book.published_at) }}</span>
            </div>
            <div class="stat-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>${{ Number(book.price).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Copies progress -->
          <div class="copies-section">
            <div class="copies-header">
              <span class="copies-label">Copies Available</span>
              <span class="copies-count">
                <strong class="copies-avail">{{ book.available_copies }}</strong>
                <span class="copies-sep"> of </span>
                <strong>{{ book.total_copies }}</strong>
              </span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: copiesPercent + '%' }"
                   :class="copiesPercent < 20 ? 'danger' : copiesPercent < 50 ? 'warn' : 'ok'">
              </div>
            </div>
            <span class="copies-pct">{{ copiesPercent }}% available</span>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <button class="btn-borrow" @click="openBorrowModal" :disabled="!book.is_available">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/></svg>
              Borrow Book
            </button>
            <button class="btn-history" @click="router.push('/books/' + book.id + '/history')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              History
            </button>
            <button class="btn-edit" @click="openEditMode">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit
            </button>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="details-grid">

        <!-- Book Details Card -->
        <div class="detail-card">
          <h2 class="card-heading">Book Details</h2>
          <div class="detail-list">
            <div class="detail-row">
              <span class="dl">ISBN</span>
              <span class="dv mono">{{ book.isbn }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Genre</span>
              <span class="dv">{{ book.genre || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Published</span>
              <span class="dv">{{ formatDate(book.published_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Price</span>
              <span class="dv">${{ Number(book.price).toFixed(2) }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Total Copies</span>
              <span class="dv">{{ book.total_copies }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Available</span>
              <span class="dv" :class="book.available_copies === 0 ? 'text-red' : 'text-green'">
                {{ book.available_copies }}
              </span>
            </div>
            <div class="detail-row">
              <span class="dl">Status</span>
              <span class="status-chip" :class="book.status">{{ book.status }}</span>
            </div>
          </div>
        </div>

        <!-- Author Card -->
        <div class="detail-card" v-if="book.author">
          <h2 class="card-heading">Author</h2>
          <div class="author-card-inner">
            <div class="author-ava-lg">{{ initial(book.author.name) }}</div>
            <div>
              <h3 class="author-card-name">{{ book.author.name }}</h3>
              <span class="author-card-status" :class="book.author.status">{{ book.author.status }}</span>
            </div>
          </div>
          <div class="detail-list" style="margin-top:16px">
            <div class="detail-row">
              <span class="dl">Nationality</span>
              <span class="dv" style="text-transform:capitalize">{{ book.author.nationality }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Phone</span>
              <span class="dv mono">{{ book.author.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="dl">Bio</span>
              <span class="dv">{{ book.author.bio }}</span>
            </div>
          </div>
        </div>

      </div>

    </template>

    <!-- Borrow Modal -->
    <div class="modal-overlay" v-if="showBorrowModal" @click.self="showBorrowModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Borrow Book</h3>
          <button class="modal-close" @click="showBorrowModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="form-error">{{ formError }}</div>

          <!-- Book preview -->
          <div class="borrow-preview">
            <img :src="book?.cover_image" class="preview-img" />
            <div>
              <p class="preview-title">{{ book?.title }}</p>
              <p class="preview-author">{{ book?.author?.name }}</p>
            </div>
          </div>

          <div class="form-group">
            <label>Borrowed Date <span class="req">*</span></label>
            <input type="date" v-model="borrowForm.borrowed_date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Due Date <span class="req">*</span></label>
            <input type="date" v-model="borrowForm.due_date" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showBorrowModal = false">Cancel</button>
          <button class="btn-borrow" @click="submitBorrow" :disabled="submitting" style="padding:10px 20px">
            {{ submitting ? 'Processing...' : 'Confirm Borrow' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="isEditing" @click.self="closeEditMode">
      <div class="modal edit-modal">
        <div class="modal-header">
          <h3>Edit Book</h3>
          <button class="modal-close" @click="closeEditMode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="editErrors.general" class="form-error">{{ editErrors.general[0] }}</div>

          <!-- Title -->
          <div class="form-group">
            <label>Title <span class="req">*</span></label>
            <input
              v-model="editForm.title"
              type="text"
              required
              class="form-input"
            />
            <span v-if="editErrors.title" class="form-error-small">{{ editErrors.title[0] }}</span>
          </div>

          <!-- ISBN -->
          <div class="form-group">
            <label>ISBN <span class="req">*</span></label>
            <input
              v-model="editForm.isbn"
              type="text"
              required
              class="form-input"
            />
            <span v-if="editErrors.isbn" class="form-error-small">{{ editErrors.isbn[0] }}</span>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="editForm.description"
              class="form-input"
              rows="3"
            ></textarea>
            <span v-if="editErrors.description" class="form-error-small">{{ editErrors.description[0] }}</span>
          </div>

          <!-- Genre -->
          <div class="form-group">
            <label>Genre <span class="req">*</span></label>
            <input
              v-model="editForm.genre"
              type="text"
              required
              class="form-input"
            />
            <span v-if="editErrors.genre" class="form-error-small">{{ editErrors.genre[0] }}</span>
          </div>

          <!-- Published At -->
          <div class="form-group">
            <label>Published At</label>
            <input
              v-model="editForm.published_at"
              type="date"
              class="form-input"
            />
            <span v-if="editErrors.published_at" class="form-error-small">{{ editErrors.published_at[0] }}</span>
          </div>

          <!-- Total Copies -->
          <div class="form-group">
            <label>Total Copies <span class="req">*</span></label>
            <input
              v-model.number="editForm.total_copies"
              type="number"
              min="1"
              required
              class="form-input"
            />
            <span v-if="editErrors.total_copies" class="form-error-small">{{ editErrors.total_copies[0] }}</span>
          </div>

          <!-- Price -->
          <div class="form-group">
            <label>Price</label>
            <input
              v-model.number="editForm.price"
              type="number"
              step="0.01"
              class="form-input"
            />
            <span v-if="editErrors.price" class="form-error-small">{{ editErrors.price[0] }}</span>
          </div>

    

          <!-- Success Message -->
          <div v-if="editSuccessMessage" class="form-success">
            {{ editSuccessMessage }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditMode" :disabled="editIsLoading">
            Cancel
          </button>
          <button class="btn-primary" @click="submitEditForm" :disabled="editIsLoading">
            {{ editIsLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toast.show, error: toast.type === 'error' }">
      {{ toast.message }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route  = useRoute()
const router = useRouter()

const book       = ref(null)
const loading    = ref(true)
const error      = ref('')
const showBorrowModal = ref(false)
const submitting = ref(false)
const formError  = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

// Edit state
const isEditing = ref(false)
const editIsLoading = ref(false)
const editSuccessMessage = ref('')
const editErrors = ref({})

const borrowForm = ref({
  book_id: '',
  borrowed_date: new Date().toISOString().split('T')[0],
  due_date: ''
})

const editForm = ref({
  title: '',
  isbn: '',
  description: '',
  genre: '',
  published_at: '',
  total_copies: null,
  price: null,
  status: 'active'
})

const copiesPercent = computed(() => {
  if (!book.value || book.value.total_copies === 0) return 0
  return Math.round((book.value.available_copies / book.value.total_copies) * 100)
})

const fetchBook = async () => {
  loading.value = true
  try {
    const res = await api.get(`/books/${route.params.id}`)
    book.value = res.data.data || res.data
    borrowForm.value.book_id = book.value.id
  } catch {
    error.value = 'Failed to load book details.'
  } finally { loading.value = false }
}

const openBorrowModal = () => {
  formError.value = ''
  borrowForm.value.due_date = ''
  showBorrowModal.value = true
}

const submitBorrow = async () => {
  if (!borrowForm.value.borrowed_date || !borrowForm.value.due_date) {
    formError.value = 'Please fill all fields'; return
  }
  submitting.value = true
  try {
    await api.post('/borrowings', { ...borrowForm.value, status: 'borrowed' })
    showBorrowModal.value = false
    showToast('Book borrowed successfully!')
    fetchBook()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Failed to borrow book'
  } finally { submitting.value = false }
}

// Edit functions
const openEditMode = () => {
  editForm.value = {
    title: book.value.title,
    isbn: book.value.isbn,
    description: book.value.description,
    genre: book.value.genre,
    published_at: book.value.published_at,
    total_copies: book.value.total_copies,
    price: book.value.price,
    status: book.value.status
  }
  editErrors.value = {}
  editSuccessMessage.value = ''
  isEditing.value = true
}

const closeEditMode = () => {
  isEditing.value = false
  editErrors.value = {}
  editSuccessMessage.value = ''
}

const submitEditForm = async () => {
  editIsLoading.value = true
  editErrors.value = {}
  editSuccessMessage.value = ''

  try {
    const response = await api.put(`/books/${book.value.id}`, editForm.value)
    book.value = response.data.data || response.data
    editSuccessMessage.value = 'Book updated successfully!'
    showToast('Book updated successfully!')
    
    setTimeout(() => {
      closeEditMode()
    }, 1500)

  } catch (error) {
    if (error.response?.status === 422) {
      editErrors.value = error.response.data.errors || {}
    } else if (error.response?.status === 403) {
      editErrors.value.general = ['You are not authorized to edit this book.']
    } else {
      editErrors.value.general = [error.response?.data?.message || 'An error occurred. Please try again.']
    }
  } finally {
    editIsLoading.value = false
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

onMounted(fetchBook)
</script>

<style scoped>
.page { padding: 32px 40px; min-height: 100vh; max-width: 1100px; font-family: 'DM Sans', sans-serif; }

/* Back */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; font-size: 13px; color: #888;
  cursor: pointer; margin-bottom: 28px; padding: 0;
  font-family: 'DM Sans', sans-serif; transition: color 0.15s;
}
.back-btn:hover { color: #141414; }

/* Loading / Error */
.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 80px; color: #aaa; font-size: 14px;
}
.spinner { width: 22px; height: 22px; border: 2px solid #e8e8e8; border-top-color: #c9a96e; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Hero */
.hero {
  display: flex; gap: 48px; align-items: flex-start;
  background: white; border-radius: 24px;
  padding: 36px; margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.hero-cover-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; flex-shrink: 0; }
.cover-shadow {
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1);
}
.cover-img { width: 200px; height: 290px; object-fit: cover; border-radius: 16px; display: block; }

.avail-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; padding: 5px 12px;
  border-radius: 20px;
}
.avail-pill.avail { background: #dcfce7; color: #16a34a; }
.avail-pill.unavail { background: #fee2e2; color: #dc2626; }
.avail-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.hero-info { flex: 1; display: flex; flex-direction: column; gap: 18px; }

.genre-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.genre-chip {
  font-size: 11px; font-weight: 500; padding: 3px 10px;
  border-radius: 20px; background: #f0ede8; color: #7a5c2e;
}
.status-chip {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px;
}
.status-chip.active { background: #dcfce7; color: #16a34a; }
.status-chip.inactive { background: #fee2e2; color: #dc2626; }

.book-title {
  font-family: 'Playfair Display', serif;
  font-size: 30px; font-weight: 600; color: #141414;
  line-height: 1.3; margin: 0;
}

.author-strip { display: flex; align-items: center; gap: 12px; }
.author-ava {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #c9a96e, #a07840);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px; flex-shrink: 0;
}
.author-name { font-size: 14px; font-weight: 500; color: #333; display: block; }
.author-nat { font-size: 11px; color: #999; text-transform: capitalize; display: block; }

.description { font-size: 13px; color: #666; line-height: 1.8; margin: 0; }

.stats-row { display: flex; gap: 8px; flex-wrap: wrap; }
.stat-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f8f8f8; border-radius: 8px;
  padding: 6px 12px; font-size: 12px; color: #555;
}

.copies-section { display: flex; flex-direction: column; gap: 6px; }
.copies-header { display: flex; justify-content: space-between; align-items: center; }
.copies-label { font-size: 12px; color: #888; }
.copies-count { font-size: 13px; color: #333; }
.copies-avail { color: #16a34a; }
.copies-sep { color: #ccc; }
.progress-track { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.progress-fill.ok   { background: linear-gradient(90deg, #16a34a, #4ade80); }
.progress-fill.warn { background: linear-gradient(90deg, #ca8a04, #fbbf24); }
.progress-fill.danger { background: linear-gradient(90deg, #dc2626, #f87171); }
.copies-pct { font-size: 11px; color: #aaa; }

.actions-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

.btn-borrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 22px; background: #141414; color: white;
  border: none; border-radius: 11px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.btn-borrow:hover:not(:disabled) { background: #2d2d2d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.btn-borrow:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

.btn-history, .btn-edit {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 18px; background: white; color: #333;
  border: 1px solid #e5e5e5; border-radius: 11px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.btn-history:hover, .btn-edit:hover { background: #f5f5f5; border-color: #ccc; }

/* Details Grid */
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.detail-card {
  background: white; border-radius: 20px; padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-heading { font-size: 15px; font-weight: 600; color: #141414; margin: 0 0 18px; }

.detail-list { display: flex; flex-direction: column; gap: 0; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 0; border-bottom: 1px solid #f5f5f5;
}
.detail-row:last-child { border-bottom: none; }
.dl { font-size: 12px; color: #999; font-weight: 400; }
.dv { font-size: 13px; color: #1a1a1a; font-weight: 500; text-align: right; }
.dv.mono { font-family: monospace; font-size: 12px; }
.text-red { color: #dc2626; }
.text-green { color: #16a34a; }

.author-card-inner { display: flex; align-items: center; gap: 14px; }
.author-ava-lg {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #c9a96e, #a07840);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 20px; flex-shrink: 0;
}
.author-card-name { font-size: 16px; font-weight: 600; color: #141414; margin: 0; }
.author-card-status {
  font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; margin-top: 4px; display: inline-block;
}
.author-card-status.active { background: #dcfce7; color: #16a34a; }
.author-card-status.inactive { background: #fee2e2; color: #dc2626; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(3px); }
.modal { background: white; border-radius: 20px; width: 460px; max-width: 90vw; box-shadow: 0 24px 64px rgba(0,0,0,0.15); animation: modalIn 0.2s ease; }
.edit-modal { width: 520px; }
@keyframes modalIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h3 { font-size: 16px; font-weight: 600; color: #141414; }
.modal-close { background: none; border: none; color: #aaa; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
.modal-close:hover { color: #333; background: #f5f5f5; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; max-height: 70vh; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #f0f0f0; }

.borrow-preview {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; background: #f8f8f8; border-radius: 12px;
}
.preview-img { width: 44px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.preview-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin: 0 0 3px; }
.preview-author { font-size: 12px; color: #888; margin: 0; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #444; }
.req { color: #dc2626; }
.form-input { border: 1px solid #e5e5e5; border-radius: 9px; padding: 10px 12px; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; color: #333; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #c9a96e; box-shadow: 0 0 0 3px rgba(201,169,110,0.1); }
.form-error { background: #fee2e2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
.form-error-small { color: #dc2626; font-size: 12px; margin-top: 2px; display: block; }
.form-success { background: #dcfce7; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; }

.btn-cancel { background: #f0f0f0; color: #333; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-cancel:hover:not(:disabled) { background: #e5e5e5; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary { background: #141414; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-primary:hover:not(:disabled) { background: #2d2d2d; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Toast */
.toast { position: fixed; bottom: 24px; right: 24px; background: #141414; color: white; padding: 12px 20px; border-radius: 10px; font-size: 13px; transform: translateY(80px); opacity: 0; transition: all 0.3s; z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.error { background: #dc2626; }
</style>