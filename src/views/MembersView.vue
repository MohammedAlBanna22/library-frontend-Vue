<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Members</h1>
        <span class="page-sub">{{ total }} member{{ total !== 1 ? 's' : '' }} total</span>
      </div>
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Member
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Search by name, email or address..." />
        <button v-if="search" class="clear-btn" @click="search = ''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab.value"
          :class="['tab-btn', filterStatus === tab.value ? 'active' : '']"
          @click="filterStatus = tab.value">
          {{ tab.label }}
          <span class="tab-count">{{ tabCount(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <span>Loading members...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredMembers.length" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      <p>No members found</p>
      <button class="btn-primary" @click="openCreate">Add first member</button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              Member <span class="sort-icon">{{ sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Address</th>
            <th @click="sortBy('membership_date')" class="sortable">
              Joined <span class="sort-icon">{{ sortField === 'membership_date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Borrowings</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in sortedMembers" :key="member.id" class="table-row">
            <td>
              <div class="member-cell">
                <div class="avatar-sm">{{ initials(member.user?.name) }}</div>
                <div>
                  <span class="member-name">{{ member.user?.name || '—' }}</span>
                  <span class="member-email">{{ member.user?.email || '' }}</span>
                </div>
              </div>
            </td>
            <td class="address-cell">{{ member.address || '—' }}</td>
            <td class="date-cell">{{ formatDate(member.membership_date) }}</td>
            <td>
              <span class="borrowings-badge">{{ member.active_Borrowings_count ?? 0 }} active</span>
            </td>
            <td>
              <span class="badge" :class="member.status">{{ member.status }}</span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEdit(member)" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button v-if="member.status === 'active'" class="action-btn suspend" @click="confirmSuspend(member)" title="Suspend">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(member)" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">← Prev</button>
      <span class="page-info">Page {{ currentPage }} of {{ lastPage }}</span>
      <button class="page-btn" :disabled="currentPage === lastPage" @click="goPage(currentPage + 1)">Next →</button>
    </div>

    <!-- ── Add/Edit Modal ─────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Member' : 'Add Member' }}</h2>
            <button class="close-btn" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitForm" class="modal-body">

            <div v-if="!editingId" class="field">
              <label>User ID <span class="required">*</span></label>
              <input v-model.number="form.user_id" type="number" placeholder="User ID" required />
              <span v-if="errors.user_id" class="field-error">{{ errors.user_id[0] }}</span>
            </div>

            <div class="field">
              <label>Address</label>
              <input v-model="form.address" type="text" placeholder="Member address..." />
              <span v-if="errors.address" class="field-error">{{ errors.address[0] }}</span>
            </div>

            <div class="field">
              <label>Membership Date <span class="required">*</span></label>
              <input v-model="form.membership_date" type="date" required />
              <span v-if="errors.membership_date" class="field-error">{{ errors.membership_date[0] }}</span>
            </div>

            <div class="field">
              <label>Status <span class="required">*</span></label>
              <select v-model="form.status" required>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
              <span v-if="errors.status" class="field-error">{{ errors.status[0] }}</span>
            </div>

            <div v-if="formError" class="form-error">{{ formError }}</div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Member') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── Suspend Confirm ───────────────────────────── -->
    <Teleport to="body">
      <div v-if="showSuspendConfirm" class="modal-backdrop" @click.self="showSuspendConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Suspend Member</h2>
            <button class="close-btn" @click="showSuspendConfirm = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">Are you sure you want to suspend <strong>{{ suspendingMember?.user?.name }}</strong>?</p>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showSuspendConfirm = false">Cancel</button>
              <button class="btn-warning" :disabled="submitting" @click="suspendMember">
                {{ submitting ? 'Suspending...' : 'Suspend' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Delete Confirm ────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Delete Member</h2>
            <button class="close-btn" @click="showDeleteConfirm = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">Are you sure you want to delete <strong>{{ deletingMember?.user?.name }}</strong>? This action cannot be undone.</p>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
              <button class="btn-danger" :disabled="submitting" @click="deleteMember">
                {{ submitting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import api from '../services/api'

// ── State ──────────────────────────────────────────────────
const members      = ref([])
const loading      = ref(false)
const search       = ref('')
const filterStatus = ref('all')
const currentPage  = ref(1)
const lastPage     = ref(1)
const total        = ref(0)
const sortField    = ref('name')
const sortDir      = ref('asc')

// Modal
const showModal  = ref(false)
const editingId  = ref(null)
const submitting = ref(false)
const formError  = ref('')
const errors     = ref({})
const form       = ref({ user_id: '', address: '', membership_date: '', status: 'active' })

// Suspend
const showSuspendConfirm = ref(false)
const suspendingMember   = ref(null)

// Delete
const showDeleteConfirm = ref(false)
const deletingMember    = ref(null)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

const tabs = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive',  value: 'inactive'  },
]

// ── Computed ───────────────────────────────────────────────
const tabCount = (status) => {
  if (status === 'all') return members.value.length
  return members.value.filter(m => m.status === status).length
}

const filteredMembers = computed(() => {
  let list = members.value

  if (filterStatus.value !== 'all') {
    list = list.filter(m => m.status === filterStatus.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(m =>
      m.user?.name?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q) ||
      m.address?.toLowerCase().includes(q)
    )
  }

  return list
})

const sortedMembers = computed(() => {
  return [...filteredMembers.value].sort((a, b) => {
    let aVal, bVal
    if (sortField.value === 'name') {
      aVal = a.user?.name ?? ''
      bVal = b.user?.name ?? ''
    } else {
      aVal = a[sortField.value] ?? ''
      bVal = b[sortField.value] ?? ''
    }
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ── Methods ────────────────────────────────────────────────
const fetchMembers = async (page = 1) => {
  loading.value = true
  try {
    const res  = await api.get('/members', { params: { page } })
    const data = res.data
    if (data.data) {
      members.value     = data.data
      currentPage.value = data.meta?.current_page ?? 1
      lastPage.value    = data.meta?.last_page ?? 1
      total.value       = data.meta?.total ?? data.data.length
    } else {
      members.value = Array.isArray(data) ? data : []
      total.value   = members.value.length
    }
  } catch {
    showToast('Failed to load members', 'error')
  } finally {
    loading.value = false
  }
}

const goPage = (page) => {
  currentPage.value = page
  fetchMembers(page)
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value   = 'asc'
  }
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const initials = (name) => {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

// ── Modal ──────────────────────────────────────────────────
const openCreate = () => {
  editingId.value = null
  form.value      = { user_id: '', address: '', membership_date: new Date().toISOString().split('T')[0], status: 'active' }
  errors.value    = {}
  formError.value = ''
  showModal.value = true
}

const openEdit = (member) => {
  editingId.value = member.id
  form.value = {
    address:         member.address ?? '',
    membership_date: member.membership_date ? member.membership_date.split('T')[0] : '',
    status:          member.status ?? 'active',
  }
  errors.value    = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true
  errors.value     = {}
  formError.value  = ''
  try {
    if (editingId.value) {
      await api.patch(`/members/${editingId.value}`, form.value)
      showToast('Member updated successfully')
    } else {
      await api.post('/members', form.value)
      showToast('Member added successfully')
    }
    closeModal()
    fetchMembers(currentPage.value)
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors ?? {}
    } else {
      formError.value = e.response?.data?.message || 'Something went wrong.'
    }
  } finally {
    submitting.value = false
  }
}

// ── Suspend ────────────────────────────────────────────────
const confirmSuspend = (member) => {
  suspendingMember.value   = member
  showSuspendConfirm.value = true
}

const suspendMember = async () => {
  submitting.value = true
  try {
    await api.patch(`/members/${suspendingMember.value.id}/suspend`)
    showSuspendConfirm.value = false
    showToast(`${suspendingMember.value.user?.name} suspended`)
    fetchMembers(currentPage.value)
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to suspend', 'error')
  } finally {
    submitting.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────
const confirmDelete = (member) => {
  deletingMember.value    = member
  showDeleteConfirm.value = true
}

const deleteMember = async () => {
  submitting.value = true
  try {
    await api.delete(`/members/${deletingMember.value.id}`)
    showDeleteConfirm.value = false
    showToast('Member deleted')
    fetchMembers(currentPage.value)
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to delete', 'error')
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

onMounted(() => fetchMembers())
onActivated(() => fetchMembers(currentPage.value))
</script>

<style scoped>
.page { padding: 32px; max-width: 1200px; }

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
  display: flex; gap: 12px; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap;
}
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #999; }
.search-input {
  width: 100%; padding: 9px 32px;
  border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; background: white; box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: #c9a96e; }
.clear-btn {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #aaa; display: flex;
}

/* Tabs */
.filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tab-btn {
  padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
  background: white; cursor: pointer; font-size: 13px; color: #666;
  display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.tab-btn.active { background: #141414; color: white; border-color: #141414; }
.tab-count {
  font-size: 11px; font-weight: 600; padding: 1px 6px;
  border-radius: 20px; background: #f0f0f0; color: #666;
}
.tab-btn.active .tab-count { background: #ffffff22; color: #fff; }

/* Loading / Empty */
.loading-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 40px; justify-content: center; color: #888; font-size: 14px;
}
.spinner {
  width: 20px; height: 20px; border: 2px solid #e0e0e0;
  border-top-color: #c9a96e; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px; color: #aaa; text-align: center;
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
  padding: 10px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa;
}
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: #555; }
.sort-icon { font-size: 10px; margin-left: 4px; }
td { padding: 13px 16px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; }
tr:last-child td { border-bottom: none; }
.table-row:hover { background: #fafaf8; }

.member-cell { display: flex; align-items: center; gap: 10px; }
.avatar-sm {
  width: 36px; height: 36px; border-radius: 50%; background: #c9a96e22;
  color: #c9a96e; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.member-name { display: block; font-weight: 500; color: #141414; }
.member-email { display: block; font-size: 11px; color: #aaa; }
.address-cell { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #777; }
.date-cell { white-space: nowrap; color: #777; font-size: 12px; }

.borrowings-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 20px;
  background: #dbeafe; color: #2563eb; font-weight: 500;
}

/* Status badges */
.badge {
  display: inline-block; font-size: 11px; font-weight: 500;
  padding: 3px 9px; border-radius: 20px; text-transform: capitalize;
}
.badge.active    { background: #dcfce7; color: #16a34a; }
.badge.suspended { background: #fef9c3; color: #854d0e; }
.badge.inactive  { background: #f0f0f0; color: #666; }

/* Actions */
.actions { display: flex; gap: 6px; }
.action-btn {
  padding: 6px; border: none; border-radius: 7px;
  cursor: pointer; display: flex; transition: all 0.15s;
}
.action-btn.edit    { background: #f0f4ff; color: #4f46e5; }
.action-btn.edit:hover    { background: #e0e7ff; }
.action-btn.suspend { background: #fef9c3; color: #854d0e; }
.action-btn.suspend:hover { background: #fef08a; }
.action-btn.delete  { background: #fff0f0; color: #dc2626; }
.action-btn.delete:hover  { background: #fee2e2; }

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 24px;
}
.page-btn {
  padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 8px;
  background: white; cursor: pointer; font-size: 13px; color: #333; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #c9a96e; color: #c9a96e; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #888; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(2px);
}
.modal {
  background: white; border-radius: 16px; width: 100%;
  max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
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
  padding: 4px; border-radius: 6px; display: flex; transition: color 0.15s;
}
.close-btn:hover { color: #333; }
.modal-body { padding: 18px 22px; }
.modal-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 16px; margin-top: 8px; border-top: 1px solid #f0f0f0;
}

/* Form */
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; font-weight: 500; color: #555; margin-bottom: 5px; }
.required { color: #dc2626; }
.field input, .field select {
  width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s;
}
.field input:focus, .field select:focus { outline: none; border-color: #c9a96e; }
.field-error { font-size: 11px; color: #dc2626; margin-top: 4px; display: block; }
.form-error {
  background: #fee2e2; color: #dc2626; padding: 8px 12px;
  border-radius: 7px; font-size: 12px; margin-bottom: 10px;
}
.confirm-msg { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; background: #141414; color: white;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { background: #2d2d2d; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 18px; background: white; color: #333;
  border: 1px solid #e0e0e0; border-radius: 10px; font-size: 13px; cursor: pointer;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-warning {
  padding: 10px 18px; background: #ca8a04; color: white;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-warning:hover:not(:disabled) { background: #a16207; }
.btn-warning:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  padding: 10px 18px; background: #dc2626; color: white;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 2000; animation: toastIn 0.25s ease;
}
.toast.success { background: #141414; color: white; }
.toast.error   { background: #dc2626; color: white; }
@keyframes toastIn {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>