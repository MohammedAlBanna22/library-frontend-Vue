<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Author Requests</h1>
        <span class="page-sub">{{ total }} request{{ total !== 1 ? 's' : '' }} total</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Search by name or reason..." />
        <button v-if="search" class="clear-btn" @click="search = ''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="filter-tabs">
        <button
          v-for="tab in tabs" :key="tab.value"
          :class="['tab-btn', filterStatus === tab.value ? 'active' : '']"
          @click="filterStatus = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'pending'" class="pending-badge">{{ pendingCount }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
      <span>Loading requests...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredRequests.length" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <p>No {{ filterStatus === 'all' ? '' : filterStatus }} requests found</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Nationality</th>
            <th>Phone</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in filteredRequests" :key="req.id" class="table-row">
            <td>
              <div class="author-name-cell">
                <div class="avatar-sm">{{ initials(req.applicant?.name) }}</div>
                <div>
                  <span class="author-name">{{ req.applicant?.name || '—' }}</span>
                  <span class="author-email">{{ req.applicant?.email || '' }}</span>
                </div>
              </div>
            </td>
            <td>
              <span v-if="req.author_profile?.nationality" class="nationality-badge">{{ req.author_profile.nationality }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>{{ req.author_profile?.phone || '—' }}</td>
            <td class="reason-cell">{{ req.reason || '—' }}</td>
            <td class="date-cell">{{ formatDate(req.created_at) }}</td>
            <td>
              <span class="badge" :class="req.status">{{ req.status }}</span>
            </td>
            <td>
              <div v-if="req.status === 'pending'" class="actions">
                <button class="action-btn approve" @click="handleApprove(req)" :disabled="submitting === req.id">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Approve
                </button>
                <button class="action-btn reject" @click="confirmReject(req)" :disabled="submitting === req.id">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Reject
                </button>
              </div>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject Confirm Modal -->
    <Teleport to="body">
      <div v-if="showRejectConfirm" class="modal-backdrop" @click.self="showRejectConfirm = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Reject Request</h2>
            <button class="close-btn" @click="showRejectConfirm = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">
              Are you sure you want to reject the request from
              <strong>{{ rejectingReq?.applicant?.name }}</strong>?
            </p>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showRejectConfirm = false">Cancel</button>
              <button class="btn-danger" :disabled="!!submitting" @click="handleReject">
                {{ submitting ? 'Rejecting...' : 'Reject' }}
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
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const requests   = ref([])
const loading    = ref(false)
const search     = ref('')
const filterStatus = ref('pending')
const submitting = ref(null)
const total      = ref(0)

const showRejectConfirm = ref(false)
const rejectingReq      = ref(null)

const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

const tabs = [
  { label: 'Pending',  value: 'pending'  },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All',      value: 'all'      },
]

const pendingCount = computed(() => requests.value.filter(r => r.status === 'pending').length)

const filteredRequests = computed(() => {
  let list = requests.value

  if (filterStatus.value !== 'all') {
    list = list.filter(r => r.status === filterStatus.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      r.applicant?.name?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q) ||
      r.author_profile?.nationality?.toLowerCase().includes(q)
    )
  }

  return list
})

const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await api.get('/author-requests')
    const data = res.data
    requests.value = data.data ?? data
    total.value    = requests.value.length
  } catch (e) {
    showToast('Failed to load requests', 'error')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (req) => {
  submitting.value = req.id
  try {
    await api.post(`/author-requests/${req.id}/approve`)
    showToast(`${req.applicant?.name} approved successfully`)
    fetchRequests()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to approve', 'error')
  } finally {
    submitting.value = null
  }
}

const confirmReject = (req) => {
  rejectingReq.value    = req
  showRejectConfirm.value = true
}

const handleReject = async () => {
  submitting.value = rejectingReq.value.id
  try {
    await api.post(`/author-requests/${rejectingReq.value.id}/reject`)
    showRejectConfirm.value = false
    showToast(`Request rejected`)
    fetchRequests()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to reject', 'error')
  } finally {
    submitting.value = null
  }
}

const initials = (name) => {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const showToast = (message, type = 'success') => {
  clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer  = setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(() => fetchRequests())
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

/* Filter tabs */
.filter-tabs { display: flex; gap: 4px; }
.tab-btn {
  padding: 8px 14px; border: 1px solid #e0e0e0; border-radius: 8px;
  background: white; cursor: pointer; font-size: 13px; color: #666;
  display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.tab-btn.active { background: #141414; color: white; border-color: #141414; }
.pending-badge {
  background: #fee2e2; color: #dc2626;
  font-size: 11px; font-weight: 600;
  padding: 1px 6px; border-radius: 20px;
}
.tab-btn.active .pending-badge { background: #dc262633; color: #fca5a5; }

/* Loading */
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

/* Empty */
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
td { padding: 13px 16px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; }
tr:last-child td { border-bottom: none; }
.table-row:hover { background: #fafaf8; }

.author-name-cell { display: flex; align-items: center; gap: 10px; }
.author-name { display: block; font-weight: 500; color: #141414; }
.author-email { display: block; font-size: 11px; color: #aaa; }
.reason-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #777; }
.date-cell { white-space: nowrap; color: #888; }
.text-muted { color: #ccc; }

.avatar-sm {
  width: 34px; height: 34px; border-radius: 50%; background: #c9a96e22;
  color: #c9a96e; font-size: 12px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.nationality-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 20px;
  background: #f0ede8; color: #555; font-weight: 500;
}

/* Status badges */
.badge {
  display: inline-block; font-size: 11px; font-weight: 500;
  padding: 3px 9px; border-radius: 20px; text-transform: capitalize;
}
.badge.pending  { background: #fef9c3; color: #854d0e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.rejected { background: #fee2e2; color: #991b1b; }

/* Actions */
.actions { display: flex; gap: 6px; }
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; border: none; border-radius: 7px;
  cursor: pointer; font-size: 12px; font-weight: 500;
  transition: all 0.15s;
}
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.approve { background: #dcfce7; color: #166534; }
.action-btn.approve:hover:not(:disabled) { background: #bbf7d0; }
.action-btn.reject  { background: #fee2e2; color: #991b1b; }
.action-btn.reject:hover:not(:disabled)  { background: #fecaca; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(2px);
}
.modal {
  background: white; border-radius: 16px; width: 100%;
  max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: slideUp 0.2s ease;
}
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
}
.close-btn:hover { color: #333; }
.modal-body { padding: 18px 22px; }
.modal-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 16px; border-top: 1px solid #f0f0f0;
}
.delete-msg { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px; }

.btn-secondary {
  padding: 9px 16px; background: white; color: #333;
  border: 1px solid #e0e0e0; border-radius: 9px; font-size: 13px; cursor: pointer;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-danger {
  padding: 9px 16px; background: #dc2626; color: white;
  border: none; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

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