<template>
  <div class="page">

    <header class="topbar">
      <div>
        <h1 class="page-title">Borrowings</h1>
        <span class="page-sub">{{ userRole === 'member' ? 'Your borrowed books' : 'Manage all borrowings' }}</span>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {{ userRole === 'member' ? 'Borrow a Book' : 'New Borrowing' }}
      </button>
    </header>

    <!-- Tabs: admin only -->
    <div class="tabs" v-if="userRole === 'admin'">
      <button class="tab" :class="{ active: activeTab === 'all' }" @click="setTab('all')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        All Borrowings
      </button>
      <button class="tab" :class="{ active: activeTab === 'overdue' }" @click="setTab('overdue')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Overdue
        <span class="tab-badge" v-if="overdueCount > 0">{{ overdueCount }}</span>
      </button>
    </div>

    <div class="panel">
      <div class="panel-toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" :placeholder="userRole === 'member' ? 'Search by book title...' : 'Search by book or member...'" class="search-input" />
          <button v-if="search" class="clear-search" @click="search = ''">✕</button>
        </div>
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Book</th>
              <th v-if="userRole === 'admin'">Member</th>
              <th>Borrowed Date</th>
              <th>Due Date</th>
              <th>Returned Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBorrowings.length === 0">
              <td :colspan="userRole === 'admin' ? 9 : 8" class="empty">No borrowings found</td>
            </tr>
            <tr v-for="b in filteredBorrowings" :key="b.id" :class="{ 'row-overdue': b.status === 'overdue' }">
              <td class="id-cell">{{ b.id }}</td>
              <td>
                <div class="book-cell">
                  <span class="book-title">{{ b.book?.title || '—' }}</span>
                  <span class="book-isbn">{{ b.book?.isbn || '' }}</span>
                </div>
              </td>
              <td v-if="userRole === 'admin'">
                <div class="member-cell">
                  <div class="member-avatar" :style="{ background: avatarColor(b.member?.name) + '22', color: avatarColor(b.member?.name) }">
                    {{ memberInitial(b.member?.name) }}
                  </div>
                  <span>{{ b.member?.name || '—' }}</span>
                </div>
              </td>
              <td>{{ formatDate(b.borrowed_date) }}</td>
              <td :class="{ 'due-soon': isDueSoon(b.due_date), 'overdue-date': isOverdue(b) }">{{ formatDate(b.due_date) }}</td>
              <td>{{ b.returned_date ? formatDate(b.returned_date) : '—' }}</td>
              <td><span class="badge" :class="b.status">{{ b.status }}</span></td>
              <td>
                <div v-if="b.fine_amount > 0" class="fine-cell">
                  <span class="fine-badge">${{ Number(b.fine_amount).toFixed(2) }}</span>
                  <span v-if="b.fine_paid" class="fine-paid-tag">paid</span>
                </div>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <div class="actions">
                  <button class="action-btn view" @click="viewBorrowing(b)" title="View">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button v-if="b.status === 'borrowed' || b.status === 'overdue'" class="action-btn return" @click="returnBook(b)" title="Return">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                  </button>
                  <button v-if="b.status === 'borrowed' && canRenew(b)" class="action-btn renew" @click="renewBorrowing(b)" title="Renew">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.5"/></svg>
                  </button>
                  <button v-if="b.fine_amount > 0 && !b.fine_paid" class="action-btn fine-pay" @click="openPayFineModal(b)" title="Pay fine">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="pagination.last_page > 1">
        <button :disabled="pagination.current_page === 1" @click="fetchBorrowings(pagination.current_page - 1)" class="page-btn">←</button>
        <span class="page-info">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <button :disabled="pagination.current_page === pagination.last_page" @click="fetchBorrowings(pagination.current_page + 1)" class="page-btn">→</button>
      </div>
    </div>

    <!-- Add Modal -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ userRole === 'member' ? 'Borrow a Book' : 'New Borrowing' }}</h3>
          <button class="modal-close" @click="closeAddModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="form-group">
            <label>Book <span class="required">*</span></label>
            <select v-model="form.book_id" class="form-input">
              <option value="">Select a book...</option>
              <option v-for="book in availableBooks" :key="book.id" :value="book.id">{{ book.title }} ({{ book.available_copies }} available)</option>
            </select>
            <span v-if="errors.book_id" class="field-error">{{ errors.book_id[0] }}</span>
          </div>
          <div v-if="userRole === 'admin'" class="form-group">
            <label>Member <span class="required">*</span></label>
            <select v-model="form.member_id" class="form-input">
              <option value="">Select a member...</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name || m.user?.name }} (ID: {{ m.id }})</option>
            </select>
            <span v-if="errors.member_id" class="field-error">{{ errors.member_id[0] }}</span>
          </div>
          <div class="form-group">
            <label>Borrowed Date <span class="required">*</span></label>
            <input type="date" v-model="form.borrowed_date" class="form-input" />
            <span v-if="errors.borrowed_date" class="field-error">{{ errors.borrowed_date[0] }}</span>
          </div>
          <div class="form-group">
            <label>Due Date <span class="required">*</span></label>
            <input type="date" v-model="form.due_date" class="form-input" />
            <span v-if="errors.due_date" class="field-error">{{ errors.due_date[0] }}</span>
          </div>
          <div v-if="userRole === 'admin'" class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-input">
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div v-if="userRole === 'admin' && form.status === 'returned'" class="form-group">
            <label>Returned Date</label>
            <input type="date" v-model="form.returned_date" class="form-input" />
            <span v-if="errors.returned_date" class="field-error">{{ errors.returned_date[0] }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddModal">Cancel</button>
          <button class="btn-primary" @click="submitBorrowing" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="showViewModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Borrowing Details</h3>
          <button class="modal-close" @click="showViewModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedBorrowing">
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="detail-label">Book</span>
              <span class="detail-value">{{ selectedBorrowing.book?.title }}</span>
              <span class="detail-sub" v-if="selectedBorrowing.book?.isbn">{{ selectedBorrowing.book.isbn }}</span>
            </div>
            <div v-if="userRole === 'admin'" class="detail-item">
              <span class="detail-label">Member</span>
              <span class="detail-value">{{ selectedBorrowing.member?.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="badge" :class="selectedBorrowing.status">{{ selectedBorrowing.status }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Borrowed</span>
              <span class="detail-value">{{ formatDate(selectedBorrowing.borrowed_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Due</span>
              <span class="detail-value" :class="{ 'text-danger': isOverdue(selectedBorrowing) }">{{ formatDate(selectedBorrowing.due_date) }}</span>
            </div>
            <div class="detail-item" v-if="selectedBorrowing.returned_date">
              <span class="detail-label">Returned</span>
              <span class="detail-value">{{ formatDate(selectedBorrowing.returned_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Renewals</span>
              <span class="detail-value">{{ selectedBorrowing.renewal_count || 0 }} / 2</span>
            </div>
            <div class="detail-item" v-if="selectedBorrowing.fine_amount > 0">
              <span class="detail-label">Fine</span>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="detail-value" style="color:#dc2626">${{ Number(selectedBorrowing.fine_amount).toFixed(2) }}</span>
                <span v-if="selectedBorrowing.fine_paid" class="fine-paid-tag">paid</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showViewModal = false">Close</button>
          <button
            v-if="selectedBorrowing?.fine_amount > 0 && !selectedBorrowing?.fine_paid"
            class="btn-payment"
            @click="openPayFineModal(selectedBorrowing); showViewModal = false"
          >Pay Fine</button>
          <button
            v-if="selectedBorrowing && (selectedBorrowing.status === 'borrowed' || selectedBorrowing.status === 'overdue')"
            class="btn-return"
            @click="returnBook(selectedBorrowing); showViewModal = false"
          >Return Book</button>
        </div>
      </div>
    </div>

    <!-- Pay Fine Modal -->
    <div class="modal-overlay" v-if="showPayFineModal" @click.self="closePayFineModal">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h3>Pay Fine</h3>
            <p class="modal-sub" v-if="fineToPayBorrowing">Borrowing #{{ fineToPayBorrowing.id }}</p>
          </div>
          <button class="modal-close" @click="closePayFineModal">✕</button>
        </div>

        <div class="modal-body" v-if="fineToPayBorrowing">
          <!-- Fine Amount Banner -->
          <div class="fine-banner">
            <div class="fine-header">
              <span class="fine-label">Fine Amount</span>
              <span class="fine-currency">USD</span>
            </div>
            <div class="fine-amount">${{ Number(fineToPayBorrowing.fine_amount).toFixed(2) }}</div>
            <div class="fine-reason">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Overdue book penalty
            </div>
          </div>

          <!-- Book & Member Info -->
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="detail-label">Book</span>
              <span class="detail-value">{{ fineToPayBorrowing.book?.title }}</span>
              <span class="detail-sub" v-if="fineToPayBorrowing.book?.isbn">ISBN: {{ fineToPayBorrowing.book.isbn }}</span>
            </div>
            <div class="detail-item" v-if="userRole === 'admin' && fineToPayBorrowing.member?.name">
              <span class="detail-label">Member</span>
              <span class="detail-value">{{ fineToPayBorrowing.member.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Due Date</span>
              <span class="detail-value" style="color:#dc2626;font-weight:600">{{ formatDate(fineToPayBorrowing.due_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Days Overdue</span>
              <span class="detail-value">{{ fineToPayBorrowing.overdue_days ?? 0 }} days</span>
            </div>
          </div>

          <!-- Breakdown -->
          <div class="breakdown">
            <div class="breakdown-title">Calculation</div>
            <div class="breakdown-row">
              <span>Fine per day</span>
              <span>${{ fineToPayBorrowing.overdue_days > 0 ? (Number(fineToPayBorrowing.fine_amount) / fineToPayBorrowing.overdue_days).toFixed(2) : '0.50' }}</span>
            </div>
            <div class="breakdown-row">
              <span>Days overdue</span>
              <span>{{ fineToPayBorrowing.overdue_days ?? 0 }}</span>
            </div>
            <div class="breakdown-row total">
              <span>Total Fine</span>
              <span>${{ Number(fineToPayBorrowing.fine_amount).toFixed(2) }}</span>
            </div>
          </div>

          <div class="payment-info">
            <div class="info-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/><rect x="4" y="5" width="16" height="6"/></svg>
              Processing library fine payment
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closePayFineModal" :disabled="payingFine">Cancel</button>
          <button class="btn-payment" @click="payFine" :disabled="payingFine">
            <svg v-if="payingFine" class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            {{ payingFine ? 'Processing...' : 'Pay Fine Now' }}
          </button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: toast.show, error: toast.type === 'error' }">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

// ─── State ────────────────────────────────────────────────────────────────────
const borrowings        = ref([])
const overdueList       = ref([])
const availableBooks    = ref([])
const members           = ref([])
const userRole          = ref('')          // ✅ فاضي مش 'member' عشان ما يتعرف غلط
const loading           = ref(false)
const submitting        = ref(false)
const search            = ref('')
const statusFilter      = ref('')
const activeTab         = ref('all')
const overdueCount      = ref(0)
const pagination        = ref({ current_page: 1, last_page: 1 })
const showAddModal      = ref(false)
const showViewModal     = ref(false)
const showPayFineModal  = ref(false)
const selectedBorrowing = ref(null)
const fineToPayBorrowing = ref(null)
const formError         = ref('')
const errors            = ref({})
const payingFine        = ref(false)
const toast             = ref({ show: false, message: '', type: 'success' })

const form = ref({
  book_id: '', member_id: '',
  borrowed_date: new Date().toISOString().split('T')[0],
  due_date: '', status: 'borrowed', returned_date: null
})

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredBorrowings = computed(() => {
  let list = activeTab.value === 'overdue' ? overdueList.value : borrowings.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(b =>
      b.book?.title?.toLowerCase().includes(q) ||
      (userRole.value === 'admin' && b.member?.name?.toLowerCase().includes(q))
    )
  }
  if (statusFilter.value) list = list.filter(b => b.status === statusFilter.value)
  return list
})

// ─── ✅ KEY FIX: fetchUserRole يستخدم /auth/me ─────────────────────────────
const fetchUserRole = async () => {
  try {
    const res = await api.get('/auth/me')   // ✅ مش /user
    userRole.value = res.data.role || 'member'
    console.log('👤 Role:', userRole.value)
  } catch (e) {
    console.error('fetchUserRole failed:', e)
    userRole.value = 'member'
  }
}

// ─── Data ──────────────────────────────────────────────────────────────────
const fetchBorrowings = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(`/borrowings?page=${page}`)
    borrowings.value = res.data.data || res.data
    if (res.data.meta) pagination.value = { current_page: res.data.meta.current_page, last_page: res.data.meta.last_page }
  } catch (e) {
    showToast('Failed to load borrowings: ' + (e.response?.data?.message || e.message), 'error')
  } finally { loading.value = false }
}

const fetchOverdue = async () => {
  try {
    const res = await api.get('/borrowings/overdue/list')
    overdueList.value  = res.data.data || res.data
    overdueCount.value = overdueList.value.length
  } catch (e) { console.error('fetchOverdue failed:', e) }
}

const fetchBooks = async () => {
  try {
    const res = await api.get('/books')
    availableBooks.value = (res.data.data || res.data).filter(b => b.is_available)
  } catch (e) { console.error(e) }
}

const fetchMembers = async () => {
  try {
    const res = await api.get('/members')
    members.value = res.data.data || res.data
  } catch (e) { console.error(e) }
}

const setTab = (tab) => {
  activeTab.value = tab
  tab === 'overdue' ? fetchOverdue() : fetchBorrowings()
}

// ─── Modals ────────────────────────────────────────────────────────────────
const openAddModal = async () => {
  await fetchBooks()
  if (userRole.value === 'admin') await fetchMembers()
  form.value = { book_id: '', member_id: '', borrowed_date: new Date().toISOString().split('T')[0], due_date: '', status: 'borrowed', returned_date: null }
  formError.value = ''
  errors.value = {}
  showAddModal.value = true
}

const closeAddModal = () => { showAddModal.value = false }

// ─── Submit ────────────────────────────────────────────────────────────────
const submitBorrowing = async () => {
  errors.value = {}
  formError.value = ''
  if (!form.value.book_id)    { errors.value.book_id = ['Book is required']; return }
  if (userRole.value === 'admin' && !form.value.member_id) { errors.value.member_id = ['Member is required']; return }
  if (!form.value.borrowed_date) { errors.value.borrowed_date = ['Required']; return }
  if (!form.value.due_date)      { errors.value.due_date = ['Required']; return }
  if (new Date(form.value.due_date) <= new Date(form.value.borrowed_date)) { errors.value.due_date = ['Must be after borrowed date']; return }
  submitting.value = true
  try {
    const payload = { ...form.value }
    if (userRole.value === 'member') delete payload.member_id
    await api.post('/borrowings', payload)
    closeAddModal()
    fetchBorrowings()
    showToast('Borrowing created successfully')
  } catch (e) {
    if (e.response?.status === 422) errors.value = e.response.data.errors || {}
    else formError.value = e.response?.data?.message || 'Failed to create borrowing'
  } finally { submitting.value = false }
}

// ─── Actions ──────────────────────────────────────────────────────────────
const returnBook = async (b) => {
  if (!confirm(`Return "${b.book?.title}"?`)) return
  try {
    await api.post(`/borrowings/${b.id}/return`)
    fetchBorrowings()
    showToast('Book returned successfully')
  } catch (e) { showToast('Failed to return: ' + (e.response?.data?.message || e.message), 'error') }
}

const renewBorrowing = async (b) => {
  if (!confirm(`Renew "${b.book?.title}"?`)) return
  try {
    await api.patch(`/borrowings/${b.id}/renew`)
    fetchBorrowings()
    showToast('Borrowing renewed')
  } catch (e) { showToast('Failed to renew: ' + (e.response?.data?.message || e.message), 'error') }
}

const viewBorrowing = async (b) => {
  try {
    const res = await api.get(`/borrowings/${b.id}`)
    selectedBorrowing.value = res.data.data || res.data
  } catch (e) { selectedBorrowing.value = b }
  showViewModal.value = true
}

// ─── Pay Fine ──────────────────────────────────────────────────────────────
const openPayFineModal = async (borrowing) => {
  try {
    // ✅ جيب بيانات الـ borrowing + بيانات الـ fine مع overdue_days
    const [borrowingRes, fineRes] = await Promise.all([
      api.get(`/borrowings/${borrowing.id}`),
      api.get(`/borrowings/${borrowing.id}/fine`)
    ])
    const borrowingData = borrowingRes.data.data || borrowingRes.data
    const fineData      = fineRes.data
    // ✅ دمج البيانات
    fineToPayBorrowing.value = {
      ...borrowingData,
      fine_amount:  fineData.fine_amount,
      overdue_days: fineData.overdue_days,
      is_overdue:   fineData.is_overdue,
      due_date:     fineData.due_date,
    }
    showPayFineModal.value = true
  } catch (e) {
    showToast('Failed to load fine details', 'error')
    console.error(e)
  }
}

const closePayFineModal = () => {
  showPayFineModal.value   = false
  fineToPayBorrowing.value = null
}

const payFine = async () => {
  if (!fineToPayBorrowing.value) return
  payingFine.value = true
  try {
    const res = await api.post(`/borrowings/${fineToPayBorrowing.value.id}/fine/pay`)
    showToast('Fine paid: $' + Number(res.data.paid_amount).toFixed(2))
    closePayFineModal()
    await fetchBorrowings()
    if (userRole.value === 'admin') fetchOverdue()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to pay fine', 'error')
  } finally { payingFine.value = false }
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const canRenew = (b) => (b.renewal_count || 0) < 2

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}

const avatarColor = (name) => {
  const colors = ['#c9a96e','#6e9cc9','#9cc96e','#c96e9c','#6ec9c9','#9c6ec9','#c9796e']
  let hash = 0
  for (let i = 0; i < (name||'').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const formatDate    = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const isDueSoon     = (d) => { if (!d) return false; const diff = (new Date(d) - new Date()) / 86400000; return diff >= 0 && diff <= 3 }
const isOverdue     = (b) => b.status === 'overdue'
const memberInitial = (n) => n ? n.charAt(0).toUpperCase() : '?'

// ─── ✅ KEY FIX: onMounted يستنى fetchUserRole أولاً ─────────────────────
onMounted(async () => {
  await fetchUserRole()                              // ✅ await ضروري
  fetchBorrowings()
  if (userRole.value === 'admin') fetchOverdue()    // ✅ بس للـ admin
})
</script>

<style scoped>
.page { padding: 32px; min-height: 100vh; }
.topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #141414; margin: 0; }
.page-sub { font-size: 13px; color: #888; margin-top: 4px; display: block; }

.tabs { display: flex; gap: 4px; margin-bottom: 16px; }
.tab { padding: 8px 18px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.tab:hover { background: #e8e4de; color: #333; }
.tab.active { background: #141414; color: white; }
.tab-badge { background: #dc2626; color: white; font-size: 10px; padding: 1px 6px; border-radius: 20px; }

.panel { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
.panel-toolbar { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; background: #f8f8f8; border-radius: 8px; padding: 0 12px; }
.search-input { flex: 1; border: none; background: transparent; padding: 9px 0; font-size: 13px; outline: none; color: #333; }
.clear-search { background: none; border: none; color: #bbb; cursor: pointer; font-size: 12px; }
.filter-select { border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #333; outline: none; background: white; }

.loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: #888; font-size: 14px; }
.spinner { width: 20px; height: 20px; border: 2px solid #e8e8e8; border-top-color: #c9a96e; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin 0.7s linear infinite; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 11px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
td { padding: 13px 16px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafaf8; }
.row-overdue td { background: #fff8f8; }

.id-cell { color: #bbb; font-size: 12px; font-family: monospace; }
.book-cell { display: flex; flex-direction: column; gap: 2px; }
.book-title { font-weight: 500; color: #1a1a1a; }
.book-isbn { font-size: 11px; color: #aaa; }
.member-cell { display: flex; align-items: center; gap: 8px; }
.member-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }

.due-soon { color: #ca8a04; font-weight: 500; }
.overdue-date { color: #dc2626; font-weight: 500; }
.text-danger { color: #dc2626; font-weight: 600; }
.empty { text-align: center; color: #bbb; padding: 48px; font-size: 14px; }

.badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.badge.borrowed { background: #dbeafe; color: #2563eb; }
.badge.returned { background: #f0f0f0; color: #666; }
.badge.overdue  { background: #fee2e2; color: #dc2626; }

.fine-cell { display: flex; align-items: center; gap: 6px; }
.fine-badge { font-size: 12px; color: #dc2626; font-weight: 600; }
.fine-paid-tag { font-size: 10px; font-weight: 500; padding: 1px 7px; border-radius: 20px; background: #dcfce7; color: #15803d; }
.text-muted { color: #ccc; }

.actions { display: flex; gap: 4px; }
.action-btn { width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.action-btn.view     { background: #f0f0f0; color: #555; }   .action-btn.view:hover     { background: #e0e0e0; }
.action-btn.return   { background: #dcfce7; color: #16a34a; } .action-btn.return:hover   { background: #bbf7d0; }
.action-btn.renew    { background: #dbeafe; color: #2563eb; } .action-btn.renew:hover    { background: #bfdbfe; }
.action-btn.fine-pay { background: #fef3c7; color: #ca8a04; } .action-btn.fine-pay:hover { background: #fde68a; color: #92400e; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; border-top: 1px solid #f0f0f0; }
.page-btn { padding: 6px 14px; border: 1px solid #e8e8e8; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #888; }

.btn-primary   { display: flex; align-items: center; gap: 6px; background: #141414; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-primary:hover { opacity: 0.85; } .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #f0f0f0; color: #333; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-return    { background: #dcfce7; color: #15803d; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-return:hover { background: #bbf7d0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
.modal { background: white; border-radius: 16px; width: 480px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
.modal-close { background: none; border: none; font-size: 16px; color: #999; cursor: pointer; padding: 4px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #f0f0f0; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #444; }
.required { color: #dc2626; }
.form-input { border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 13px; outline: none; color: #333; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #c9a96e; }
.form-error { background: #fee2e2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
.field-error { font-size: 11px; color: #dc2626; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.full-width { grid-column: 1 / -1; }
.detail-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-value { font-size: 14px; color: #1a1a1a; font-weight: 500; }
.detail-sub { font-size: 11px; color: #bbb; }
.modal-sub { font-size: 12px; color: #bbb; margin: 4px 0 0; }

/* Pay Fine Modal */
.fine-banner { background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%); border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; text-align: center; }
.fine-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.fine-label { font-size: 11px; font-weight: 500; color: #dc2626; text-transform: uppercase; letter-spacing: 0.06em; }
.fine-currency { font-size: 10px; color: #bbb; }
.fine-amount { font-size: 36px; font-weight: 700; color: #dc2626; font-family: 'Playfair Display', serif; line-height: 1; margin: 8px 0; }
.fine-reason { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 12px; color: #999; }

.breakdown { background: #f9f9f9; border: 1px solid #ede9e3; border-radius: 10px; padding: 14px; }
.breakdown-title { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
.breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ede9e3; color: #666; }
.breakdown-row:last-child { border-bottom: none; }
.breakdown-row.total { font-weight: 700; color: #dc2626; border-top: 2px solid #ede9e3; padding-top: 12px; margin-top: 4px; }

.payment-info { }
.info-badge { display: flex; align-items: center; gap: 8px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #1d4ed8; }

.btn-payment { display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(22,163,74,0.2); }
.btn-payment:hover:not(:disabled) { background: linear-gradient(135deg, #15803d 0%, #166534 100%); transform: translateY(-1px); }
.btn-payment:disabled { opacity: 0.6; cursor: not-allowed; }

.toast { position: fixed; bottom: 24px; right: 24px; background: #141414; color: white; padding: 12px 20px; border-radius: 10px; font-size: 13px; transform: translateY(80px); opacity: 0; transition: all 0.3s; z-index: 200; }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.error { background: #dc2626; }
</style>