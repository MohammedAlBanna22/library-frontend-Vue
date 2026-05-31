<template>
  <div class="page">

    <header class="topbar">
      <div>
        <h1 class="page-title">Borrowings</h1>
        <span class="page-sub">Manage all book borrowings</span>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Borrowing
      </button>
    </header>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'all' }" @click="setTab('all')">All Borrowings</button>
      <button class="tab" :class="{ active: activeTab === 'overdue' }" @click="setTab('overdue')">
        Overdue
        <span class="tab-badge" v-if="overdueCount > 0">{{ overdueCount }}</span>
      </button>
    </div>

    <div class="panel">
      <div class="panel-toolbar">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" placeholder="Search by book or member..." class="search-input" />
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
        <span>Loading borrowings...</span>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Book</th><th>Member</th><th>Borrowed Date</th>
              <th>Due Date</th><th>Returned Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBorrowings.length === 0">
              <td colspan="8" class="empty">No borrowings found</td>
            </tr>
            <tr v-for="b in filteredBorrowings" :key="b.id" :class="{ 'row-overdue': b.status === 'overdue' }">
              <td class="id-cell">{{ b.id }}</td>
              <td>
                <div class="book-cell">
                  <span class="book-title">{{ b.book?.title || '—' }}</span>
                  <span class="book-isbn">{{ b.book?.isbn || '' }}</span>
                </div>
              </td>
              <td>
                <div class="member-cell">
                  <div class="member-avatar">{{ memberInitial(b.member?.name) }}</div>
                  <span>{{ b.member?.name || '—' }}</span>
                </div>
              </td>
              <td>{{ formatDate(b.borrowed_date) }}</td>
              <td :class="{ 'due-soon': isDueSoon(b.due_date), 'overdue-date': isOverdue(b) }">{{ formatDate(b.due_date) }}</td>
              <td>{{ b.returned_date ? formatDate(b.returned_date) : '—' }}</td>
              <td><span class="badge" :class="b.status">{{ b.status }}</span></td>
              <td>
                <div class="actions">
                  <button class="action-btn view" @click="viewBorrowing(b)" title="View">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button v-if="b.status === 'borrowed' || b.status === 'overdue'" class="action-btn return" @click="returnBook(b)" title="Return">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                  </button>
                  <button v-if="b.status === 'borrowed'" class="action-btn renew" @click="renewBorrowing(b)" title="Renew">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.5"/></svg>
                  </button>
                  <button v-if="b.fine_amount > 0" class="action-btn fine" @click="viewFine(b)" title="Fine">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
          <h3>New Borrowing</h3>
          <button class="modal-close" @click="closeAddModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="form-group">
            <label>Book <span class="required">*</span></label>
            <select v-model="form.book_id" class="form-input">
              <option value="">Select a book...</option>
              <option v-for="book in availableBooks" :key="book.id" :value="book.id">
                {{ book.title }} ({{ book.available_copies }} available)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Borrowed Date <span class="required">*</span></label>
            <input type="date" v-model="form.borrowed_date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Due Date <span class="required">*</span></label>
            <input type="date" v-model="form.due_date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-input">
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddModal">Cancel</button>
          <button class="btn-primary" @click="submitBorrowing" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Borrowing' }}
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
            <div class="detail-item"><span class="detail-label">Book</span><span class="detail-value">{{ selectedBorrowing.book?.title }}</span></div>
            <div class="detail-item"><span class="detail-label">ISBN</span><span class="detail-value">{{ selectedBorrowing.book?.isbn }}</span></div>
            <div class="detail-item"><span class="detail-label">Member</span><span class="detail-value">{{ selectedBorrowing.member?.name }}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="badge" :class="selectedBorrowing.status">{{ selectedBorrowing.status }}</span></div>
            <div class="detail-item"><span class="detail-label">Borrowed Date</span><span class="detail-value">{{ formatDate(selectedBorrowing.borrowed_date) }}</span></div>
            <div class="detail-item"><span class="detail-label">Due Date</span><span class="detail-value">{{ formatDate(selectedBorrowing.due_date) }}</span></div>
            <div class="detail-item" v-if="selectedBorrowing.returned_date"><span class="detail-label">Returned Date</span><span class="detail-value">{{ formatDate(selectedBorrowing.returned_date) }}</span></div>
            <div class="detail-item" v-if="selectedBorrowing.fine_amount > 0"><span class="detail-label">Fine</span><span class="detail-value" style="color:#dc2626;font-weight:600">${{ selectedBorrowing.fine_amount }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showViewModal = false">Close</button>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: toast.show, error: toast.type === 'error' }">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const borrowings = ref([])
const overdueList = ref([])
const availableBooks = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('')
const activeTab = ref('all')
const overdueCount = ref(0)
const pagination = ref({ current_page: 1, last_page: 1 })
const showAddModal = ref(false)
const showViewModal = ref(false)
const selectedBorrowing = ref(null)
const formError = ref('')
const toast = ref({ show: false, message: '', type: 'success' })
const form = ref({ book_id: '', borrowed_date: new Date().toISOString().split('T')[0], due_date: '', status: 'borrowed', returned_date: null })

const filteredBorrowings = computed(() => {
  let list = activeTab.value === 'overdue' ? overdueList.value : borrowings.value
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(b => b.book?.title?.toLowerCase().includes(q) || b.member?.name?.toLowerCase().includes(q)) }
  if (statusFilter.value) list = list.filter(b => b.status === statusFilter.value)
  return list
})

const fetchBorrowings = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(`/borrowings?page=${page}`)
    borrowings.value = res.data.data || res.data
    if (res.data.meta) pagination.value = { current_page: res.data.meta.current_page, last_page: res.data.meta.last_page }
  } catch { showToast('Failed to load borrowings', 'error') }
  finally { loading.value = false }
}

const fetchOverdue = async () => {
  try { const res = await api.get('/borrowings/overdue/list'); overdueList.value = res.data.data || res.data; overdueCount.value = overdueList.value.length } catch {}
}

const fetchBooks = async () => {
  try { const res = await api.get('/books'); availableBooks.value = (res.data.data || res.data).filter(b => b.is_available) } catch {}
}

const setTab = (tab) => { activeTab.value = tab; tab === 'overdue' ? fetchOverdue() : fetchBorrowings() }

const openAddModal = () => {
  fetchBooks()
  form.value = { book_id: '', borrowed_date: new Date().toISOString().split('T')[0], due_date: '', status: 'borrowed', returned_date: null }
  formError.value = ''; showAddModal.value = true
}
const closeAddModal = () => { showAddModal.value = false }

const submitBorrowing = async () => {
  if (!form.value.book_id || !form.value.borrowed_date || !form.value.due_date) { formError.value = 'Please fill all required fields'; return }
  submitting.value = true
  try { await api.post('/borrowings', form.value); closeAddModal(); fetchBorrowings(); showToast('Borrowing created successfully') }
  catch (e) { formError.value = e.response?.data?.message || 'Failed to create borrowing' }
  finally { submitting.value = false }
}

const returnBook = async (b) => {
  if (!confirm(`Return "${b.book?.title}"?`)) return
  try { await api.post(`/borrowings/${b.id}/return`); fetchBorrowings(); showToast('Book returned successfully') }
  catch { showToast('Failed to return book', 'error') }
}

const renewBorrowing = async (b) => {
  if (!confirm(`Renew "${b.book?.title}"?`)) return
  try { await api.patch(`/borrowings/${b.id}/renew`); fetchBorrowings(); showToast('Borrowing renewed') }
  catch { showToast('Failed to renew', 'error') }
}

const viewBorrowing = async (b) => {
  try { const res = await api.get(`/borrowings/${b.id}`); selectedBorrowing.value = res.data.data || res.data }
  catch { selectedBorrowing.value = b }
  showViewModal.value = true
}

const viewFine = async (b) => {
  try { const res = await api.get(`/borrowings/${b.id}/fine`); alert(`Fine: $${res.data.fine_amount}`) }
  catch { showToast('Failed to load fine', 'error') }
}

const showToast = (message, type = 'success') => { toast.value = { show: true, message, type }; setTimeout(() => { toast.value.show = false }, 3000) }
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const isDueSoon = (d) => { if (!d) return false; const diff = (new Date(d) - new Date()) / 86400000; return diff >= 0 && diff <= 3 }
const isOverdue = (b) => b.status === 'overdue'
const memberInitial = (n) => n ? n.charAt(0).toUpperCase() : '?'

onMounted(() => { fetchBorrowings(); fetchOverdue() })
</script>

<style scoped>
.page { padding: 32px; min-height: 100vh; }
.topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #141414; }
.page-sub { font-size: 13px; color: #888; margin-top: 4px; display: block; }
.tabs { display: flex; gap: 4px; margin-bottom: 16px; }
.tab { padding: 8px 18px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.tab:hover { background: #e8e4de; color: #333; }
.tab.active { background: #141414; color: white; }
.tab-badge { background: #dc2626; color: white; font-size: 10px; padding: 1px 6px; border-radius: 20px; }
.panel { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
.panel-toolbar { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; background: #f8f8f8; border-radius: 8px; padding: 0 12px; }
.search-input { flex: 1; border: none; background: transparent; padding: 9px 0; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; color: #333; }
.filter-select { border: 1px solid #e8e8e8; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #333; outline: none; background: white; font-family: 'DM Sans', sans-serif; }
.loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: #888; font-size: 14px; }
.spinner { width: 20px; height: 20px; border: 2px solid #e8e8e8; border-top-color: #c9a96e; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 11px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
td { padding: 13px 16px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafaf8; }
.row-overdue td { background: #fff8f8; }
.id-cell { color: #bbb; font-size: 12px; font-family: monospace; }
.book-cell { display: flex; flex-direction: column; gap: 2px; max-width: 180px; }
.book-title { font-weight: 500; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.book-isbn { font-size: 11px; color: #aaa; }
.member-cell { display: flex; align-items: center; gap: 8px; }
.member-avatar { width: 28px; height: 28px; background: #c9a96e22; color: #c9a96e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.due-soon { color: #ca8a04; font-weight: 500; }
.overdue-date { color: #dc2626; font-weight: 500; }
.empty { text-align: center; color: #bbb; padding: 48px; font-size: 14px; }
.badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.badge.borrowed { background: #dbeafe; color: #2563eb; }
.badge.returned { background: #f0f0f0; color: #666; }
.badge.overdue { background: #fee2e2; color: #dc2626; }
.actions { display: flex; gap: 4px; }
.action-btn { width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.action-btn.view { background: #f0f0f0; color: #555; } .action-btn.view:hover { background: #e0e0e0; }
.action-btn.return { background: #dcfce7; color: #16a34a; } .action-btn.return:hover { background: #bbf7d0; }
.action-btn.renew { background: #dbeafe; color: #2563eb; } .action-btn.renew:hover { background: #bfdbfe; }
.action-btn.fine { background: #fee2e2; color: #dc2626; } .action-btn.fine:hover { background: #fecaca; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; border-top: 1px solid #f0f0f0; }
.page-btn { padding: 6px 14px; border: 1px solid #e8e8e8; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #888; }
.btn-primary { display: flex; align-items: center; gap: 6px; background: #141414; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-primary:hover { opacity: 0.85; } .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #f0f0f0; color: #333; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
.modal { background: white; border-radius: 16px; width: 480px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-close { background: none; border: none; font-size: 16px; color: #999; cursor: pointer; padding: 4px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #f0f0f0; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #444; }
.required { color: #dc2626; }
.form-input { border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; color: #333; width: 100%; }
.form-input:focus { border-color: #c9a96e; }
.form-error { background: #fee2e2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-value { font-size: 14px; color: #1a1a1a; font-weight: 500; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #141414; color: white; padding: 12px 20px; border-radius: 10px; font-size: 13px; transform: translateY(80px); opacity: 0; transition: all 0.3s; z-index: 200; }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.error { background: #dc2626; }
</style>