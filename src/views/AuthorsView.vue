<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Authors</h1>
        <span class="page-sub">{{ total }} author{{ total !== 1 ? 's' : '' }} total</span>
      </div>
      <button class="btn-primary" @click="$router.push('/author-requests')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Author Requests
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="search"
          class="search-input"
          placeholder="Search by name or nationality..."
          @input="onSearch"
        />
        <button v-if="search" class="clear-btn" @click="clearSearch">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <select v-model="filterNationality" class="filter-select">
        <option value="">All nationalities</option>
        <option v-for="n in nationalities" :key="n" :value="n">{{ n }}</option>
      </select>

      <div class="view-toggle">
        <button :class="['toggle-btn', viewMode === 'table' ? 'active' : '']" @click="viewMode = 'table'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </button>
        <button :class="['toggle-btn', viewMode === 'cards' ? 'active' : '']" @click="viewMode = 'cards'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <span>Loading authors...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!authors.length" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <p>No authors found</p>
      <button class="btn-primary" @click="openCreate">Add first author</button>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              Name <span class="sort-icon">{{ sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Nationality</th>
            <th>Phone</th>
            <th>Bio</th>
            <th @click="sortBy('books_count')" class="sortable">
              Books <span class="sort-icon">{{ sortField === 'books_count' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in sortedAuthors" :key="author.id" class="table-row">
            <td>
              <div class="author-name-cell">
                <div class="avatar-sm">{{ initials(author.name) }}</div>
                <span class="author-name">{{ author.name }}</span>
              </div>
            </td>
            <td>
              <span v-if="author.nationality" class="nationality-badge">{{ author.nationality }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>{{ author.phone || '—' }}</td>
            <td class="bio-cell">{{ author.bio || '—' }}</td>
            <td>
              <span class="books-count">{{ author.books_count ?? 0 }}</span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEdit(author)" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(author)" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards View -->
    <div v-else class="cards-grid">
      <div v-for="author in sortedAuthors" :key="author.id" class="author-card">
        <div class="card-header">
          <div class="avatar-lg">{{ initials(author.name) }}</div>
          <div class="card-actions">
            <button class="action-btn edit" @click="openEdit(author)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="action-btn delete" @click="confirmDelete(author)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
        <h3 class="card-name">{{ author.name }}</h3>
        <span v-if="author.nationality" class="nationality-badge">{{ author.nationality }}</span>
        <p class="card-bio">{{ author.bio || 'No bio available.' }}</p>
        <div class="card-footer">
          <span class="books-count-label">{{ author.books_count ?? 0 }} books</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">← Prev</button>
      <span class="page-info">Page {{ currentPage }} of {{ lastPage }}</span>
      <button class="page-btn" :disabled="currentPage === lastPage" @click="goPage(currentPage + 1)">Next →</button>
    </div>

    <!-- ── Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Author' : 'Add Author' }}</h2>
            <button class="close-btn" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="modal-body">
            <div class="field">
              <label>Name <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="Author full name" required />
              <span v-if="errors.name" class="field-error">{{ errors.name[0] }}</span>
            </div>

            <div class="field">
              <label>Nationality</label>
              <input v-model="form.nationality" type="text" placeholder="e.g. Palestinian, British..." />
              <span v-if="errors.nationality" class="field-error">{{ errors.nationality[0] }}</span>
            </div>

            <div class="field">
              <label>Phone</label>
              <input v-model="form.phone" type="text" placeholder="e.g. +970599123456" />
              <span v-if="errors.phone" class="field-error">{{ errors.phone[0] }}</span>
            </div>

            <div class="field">
              <label>Bio</label>
              <textarea v-model="form.bio" rows="4" placeholder="Short biography..."></textarea>
              <span v-if="errors.bio" class="field-error">{{ errors.bio[0] }}</span>
            </div>

            <div v-if="formError" class="form-error">{{ formError }}</div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Author') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── Delete Confirm ────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Delete Author</h2>
            <button class="close-btn" @click="showDeleteConfirm = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">Are you sure you want to delete <strong>{{ deletingAuthor?.name }}</strong>? This action cannot be undone.</p>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
              <button class="btn-danger" :disabled="submitting" @click="deleteAuthor">
                {{ submitting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import api from '../services/api'
// ── State ──────────────────────────────────────────────────
const authors       = ref([])
const loading       = ref(false)
const search        = ref('')
const filterNationality = ref('')
const nationalities = ref([])
const viewMode      = ref('table')
const currentPage   = ref(1)
const lastPage      = ref(1)
const total         = ref(0)
const sortField     = ref('name')
const sortDir       = ref('asc')

// Modal
const showModal   = ref(false)
const editingId   = ref(null)
const submitting  = ref(false)
const formError   = ref('')
const errors      = ref({})
const form        = ref({ name: '', nationality: '', bio: '' })

// Delete
const showDeleteConfirm = ref(false)
const deletingAuthor    = ref(null)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

// ── Computed ───────────────────────────────────────────────
// السيرش والفلترة client-side لأن الـ API ما بيدعمها
const filteredAuthors = computed(() => {
  let list = authors.value

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.nationality?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q)
    )
  }

  if (filterNationality.value) {
    list = list.filter(a => a.nationality === filterNationality.value)
  }

  return list
})

const sortedAuthors = computed(() => {
  return [...filteredAuthors.value].sort((a, b) => {
    const aVal = a[sortField.value] ?? ''
    const bVal = b[sortField.value] ?? ''
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ── Methods ────────────────────────────────────────────────
const fetchAuthors = async () => {
  loading.value = true
  try {
    const res = await api.get('/authors')
    const data = res.data

    if (data.data) {
      authors.value     = data.data
      total.value       = data.meta?.total ?? data.data.length
      lastPage.value    = data.meta?.last_page ?? 1
      currentPage.value = data.meta?.current_page ?? 1
    } else {
      authors.value = Array.isArray(data) ? data : []
      total.value   = authors.value.length
    }

    // بناء قائمة الجنسيات تلقائياً
    const allNat = authors.value.map(a => a.nationality).filter(Boolean)
    nationalities.value = [...new Set(allNat)].sort()
  } catch (e) {
    showToast('Failed to load authors', 'error')
  } finally {
    loading.value = false
  }
}

// السيرش فوري بدون API call
const onSearch = () => {}
const clearSearch = () => { search.value = '' }

const goPage = (page) => { currentPage.value = page }

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value   = 'asc'
  }
}

const initials = (name) => {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

// ── Modal ──────────────────────────────────────────────────
const openCreate = () => {
  editingId.value = null
  form.value      = { name: '', nationality: '', bio: '', phone: '' }
  errors.value    = {}
  formError.value = ''
  showModal.value = true
}

const openEdit = (author) => {
  editingId.value = author.id
  form.value      = { name: author.name ?? '', nationality: author.nationality ?? '', bio: author.bio ?? '', phone: author.phone ?? '' }
  errors.value    = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  submitting.value = true
  errors.value     = {}
  formError.value  = ''
  try {
    if (editingId.value) {
      await api.put(`/authors/${editingId.value}`, form.value)
      showToast('Author updated successfully')
    } else {
      await api.post('/authors', form.value)
      showToast('Author added successfully')
    }
    closeModal()
    fetchAuthors()
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors ?? {}
    } else {
      formError.value = 'Something went wrong. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────
const confirmDelete = (author) => {
  deletingAuthor.value    = author
  showDeleteConfirm.value = true
}

const deleteAuthor = async () => {
  submitting.value = true
  try {
    await api.delete(`/authors/${deletingAuthor.value.id}`)
    showDeleteConfirm.value = false
    showToast('Author deleted')
    fetchAuthors()
  } catch (e) {
    showToast('Failed to delete author', 'error')
  } finally {
    submitting.value = false
  }
}

// ── Toast ──────────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer  = setTimeout(() => { toast.value.show = false }, 3000)
}

// ── Init ───────────────────────────────────────────────────
onMounted(() => fetchAuthors())
onActivated(() => {
  fetchAuthors()
})
</script>

<style scoped>
.page { padding: 32px; max-width: 1200px; }

/* Header */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 600; color: #141414; margin: 0;
}
.page-sub { font-size: 13px; color: #888; margin-top: 2px; display: block; }

/* Toolbar */
.toolbar {
  display: flex; gap: 10px; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap;
}
.search-wrap {
  position: relative; flex: 1; min-width: 220px;
}
.search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #999;
}
.search-input {
  width: 100%; padding: 9px 32px 9px 32px;
  border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; background: white; box-sizing: border-box;
  transition: border-color 0.15s;
}
.search-input:focus { outline: none; border-color: #c9a96e; }
.clear-btn {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #aaa; padding: 2px;
  display: flex;
}
.filter-select {
  padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; background: white; cursor: pointer; color: #333;
}
.filter-select:focus { outline: none; border-color: #c9a96e; }
.view-toggle { display: flex; gap: 4px; }
.toggle-btn {
  padding: 8px; border: 1px solid #e0e0e0; border-radius: 7px;
  background: white; cursor: pointer; color: #888; display: flex;
  transition: all 0.15s;
}
.toggle-btn.active { background: #141414; color: white; border-color: #141414; }

/* Loading */
.loading-wrap {
  display: flex; align-items: center; gap: 10px; padding: 40px;
  justify-content: center; color: #888; font-size: 14px;
}
.spinner {
  width: 20px; height: 20px; border: 2px solid #e0e0e0;
  border-top-color: #c9a96e; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 20px; color: #aaa; text-align: center;
}
.empty-state p { font-size: 15px; color: #999; }

/* Table */
.table-wrap {
  background: white; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
}
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; font-size: 11px; color: #999; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
  padding: 10px 16px; border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: #555; }
.sort-icon { font-size: 10px; margin-left: 4px; }
td { padding: 13px 16px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; }
tr:last-child td { border-bottom: none; }
.table-row:hover { background: #fafaf8; }

.author-name-cell { display: flex; align-items: center; gap: 10px; }
.author-name { font-weight: 500; color: #141414; }
.bio-cell { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #777; }
.text-muted { color: #ccc; }

/* Avatars */
.avatar-sm {
  width: 30px; height: 30px; border-radius: 50%; background: #c9a96e22;
  color: #c9a96e; font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.avatar-lg {
  width: 52px; height: 52px; border-radius: 50%; background: #c9a96e22;
  color: #c9a96e; font-size: 17px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}

/* Badges */
.nationality-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 20px;
  background: #f0ede8; color: #555; font-weight: 500;
}
.books-count {
  font-size: 13px; font-weight: 600; color: #c9a96e;
  background: #c9a96e15; padding: 2px 8px; border-radius: 20px;
}

/* Actions */
.actions { display: flex; gap: 6px; }
.action-btn {
  padding: 6px; border: none; border-radius: 7px;
  cursor: pointer; display: flex; transition: all 0.15s;
}
.action-btn.edit { background: #f0f4ff; color: #4f46e5; }
.action-btn.edit:hover { background: #e0e7ff; }
.action-btn.delete { background: #fff0f0; color: #dc2626; }
.action-btn.delete:hover { background: #fee2e2; }

/* Cards */
.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.author-card {
  background: white; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 8px;
  transition: box-shadow 0.15s;
}
.author-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.card-name { font-size: 15px; font-weight: 600; color: #141414; }
.card-bio {
  font-size: 12px; color: #888; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}
.card-footer { margin-top: 4px; }
.books-count-label { font-size: 12px; color: #c9a96e; font-weight: 500; }

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 24px;
}
.page-btn {
  padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 8px;
  background: white; cursor: pointer; font-size: 13px; color: #333;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #c9a96e; color: #c9a96e; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #888; }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; background: #141414; color: white;
  border: none; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { background: #2a2a2a; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 9px 16px; background: white; color: #333;
  border: 1px solid #e0e0e0; border-radius: 9px; font-size: 13px;
  cursor: pointer; transition: background 0.15s;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-danger {
  padding: 9px 16px; background: #dc2626; color: white;
  border: none; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(2px);
}
.modal {
  background: white; border-radius: 16px; width: 100%;
  max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: slideUp 0.2s ease;
}
.modal-sm { max-width: 380px; }
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 0;
}
.modal-header h2 { font-size: 17px; font-weight: 600; color: #141414; }
.close-btn {
  background: none; border: none; cursor: pointer; color: #aaa;
  padding: 4px; border-radius: 6px; display: flex;
  transition: color 0.15s;
}
.close-btn:hover { color: #333; }
.modal-body { padding: 18px 22px; }
.modal-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 16px; margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

/* Form */
.field { margin-bottom: 14px; }
.field label {
  display: block; font-size: 12px; font-weight: 500;
  color: #555; margin-bottom: 5px;
}
.required { color: #dc2626; }
.field input, .field textarea {
  width: 100%; padding: 9px 12px;
  border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; box-sizing: border-box;
  transition: border-color 0.15s; font-family: inherit; resize: vertical;
}
.field input:focus, .field textarea:focus {
  outline: none; border-color: #c9a96e;
}
.field-error { font-size: 11px; color: #dc2626; margin-top: 4px; display: block; }
.form-error {
  background: #fee2e2; color: #dc2626; padding: 8px 12px;
  border-radius: 7px; font-size: 12px; margin-bottom: 10px;
}
.delete-msg { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 2000; animation: toastIn 0.25s ease;
}
.toast.success { background: #141414; color: white; }
.toast.error   { background: #dc2626; color: white; }
@keyframes toastIn {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>