<template>
  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">Dashboard</h1>
        <span class="page-date">{{ currentDate }}</span>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Books</span>
          <span class="stat-value">{{ statsLoading ? '...' : stats.total_books }}</span>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Members</span>
          <span class="stat-value">{{ statsLoading ? '...' : stats.total_members }}</span>
        </div>
      </div>

      <div class="stat-card amber">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Authors</span>
          <span class="stat-value">{{ statsLoading ? '...' : stats.total_authors }}</span>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Overdue</span>
          <span class="stat-value">{{ statsLoading ? '...' : stats.overdue_borrowings }}</span>
        </div>
      </div>
    </div>

    <!-- Second row: borrowed + overdue -->
    <div class="content-row">

      <!-- Recent Borrowings -->
      <div class="panel">
        <div class="panel-header">
          <h2>Recent Borrowings</h2>
          <RouterLink to="/borrowings" class="see-all">See all →</RouterLink>
        </div>

        <div v-if="borrowingsLoading" class="loading">
          <div class="spinner"></div> Loading...
        </div>

        <div v-else-if="recentBorrowings.length === 0" class="empty">No borrowings yet</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in recentBorrowings" :key="b.id">
                <td>
                  <div class="member-cell">
                    <div class="member-avatar">{{ initial(b.member?.name) }}</div>
                    {{ b.member?.name || '—' }}
                  </div>
                </td>
                <td class="book-cell">{{ b.book?.title || '—' }}</td>
                <td :class="{ 'text-red': b.status === 'overdue' }">{{ formatDate(b.due_date) }}</td>
                <td><span class="badge" :class="b.status">{{ b.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Overdue Panel -->
      <div class="panel overdue-panel">
        <div class="panel-header">
          <h2>Overdue Books</h2>
          <span class="overdue-count">{{ overdueList.length }}</span>
        </div>

        <div v-if="overdueLoading" class="loading">
          <div class="spinner"></div> Loading...
        </div>

        <div v-else-if="overdueList.length === 0" class="empty">No overdue books 🎉</div>

        <div v-else class="overdue-list">
          <div class="overdue-item" v-for="item in overdueList" :key="item.id">
            <div class="overdue-info">
              <span class="overdue-book">{{ item.book?.title || '—' }}</span>
              <span class="overdue-member">{{ item.member?.name || '—' }}</span>
            </div>
            <span class="overdue-days">{{ daysSince(item.due_date) }}d late</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const stats = ref({
  total_books: 0,
  total_authors: 0,
  total_members: 0,
  books_borrowed: 0,
  overdue_borrowings: 0
})

const recentBorrowings = ref([])
const overdueList      = ref([])

const statsLoading     = ref(true)
const borrowingsLoading = ref(true)
const overdueLoading   = ref(true)

const fetchStats = async () => {
  try {
    const res = await api.get('/statistics')
    stats.value = res.data
  } catch {}
  finally { statsLoading.value = false }
}

const fetchRecentBorrowings = async () => {
  try {
    const res = await api.get('/borrowings?page=1')
    const data = res.data.data || res.data
    recentBorrowings.value = data.slice(0, 5)
  } catch {}
  finally { borrowingsLoading.value = false }
}

const fetchOverdue = async () => {
  try {
    const res = await api.get('/borrowings/overdue/list')
    overdueList.value = (res.data.data || res.data).slice(0, 5)
  } catch {}
  finally { overdueLoading.value = false }
}

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'

const daysSince = (d) => {
  if (!d) return 0
  return Math.max(0, Math.floor((new Date() - new Date(d)) / 86400000))
}

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

onMounted(() => {
  fetchStats()
  fetchRecentBorrowings()
  fetchOverdue()
})
</script>

<style scoped>
.main { padding: 36px 40px; min-height: 100vh; }

.topbar { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 36px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #141414; line-height: 1; }
.page-date { font-size: 13px; color: #888; margin-top: 6px; display: block; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }

.stat-card {
  background: white; border-radius: 18px; padding: 26px 22px;
  display: flex; align-items: center; gap: 18px;
  position: relative; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); }

.stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-card.blue  .stat-icon { background: #dbeafe; color: #2563eb; }
.stat-card.green .stat-icon { background: #dcfce7; color: #16a34a; }
.stat-card.amber .stat-icon { background: #fef9c3; color: #ca8a04; }
.stat-card.red   .stat-icon { background: #fee2e2; color: #dc2626; }

.stat-body { display: flex; flex-direction: column; flex: 1; }
.stat-label { font-size: 13px; color: #888; }
.stat-value { font-size: 34px; font-weight: 600; color: #141414; line-height: 1.2; margin-top: 4px; }

.content-row { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }

.panel { background: white; border-radius: 18px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.panel-header h2 { font-size: 16px; font-weight: 600; color: #141414; }
.see-all { font-size: 13px; color: #c9a96e; text-decoration: none; font-weight: 500; }

.loading { display: flex; align-items: center; gap: 8px; padding: 24px; color: #888; font-size: 13px; justify-content: center; }
.spinner { width: 16px; height: 16px; border: 2px solid #e8e8e8; border-top-color: #c9a96e; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty { text-align: center; color: #bbb; padding: 32px; font-size: 14px; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 11px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
td { padding: 13px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.book-cell { color: #555; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-red { color: #dc2626; font-weight: 500; }

.member-cell { display: flex; align-items: center; gap: 8px; }
.member-avatar { width: 26px; height: 26px; background: #c9a96e22; color: #c9a96e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }

.badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; }
.badge.borrowed { background: #dbeafe; color: #2563eb; }
.badge.active   { background: #dcfce7; color: #16a34a; }
.badge.overdue  { background: #fee2e2; color: #dc2626; }
.badge.returned { background: #f0f0f0; color: #666; }

.overdue-count { background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.overdue-list { display: flex; flex-direction: column; gap: 12px; }
.overdue-item { display: flex; align-items: center; justify-content: space-between; padding: 14px; background: #fafafa; border-radius: 12px; border-left: 3px solid #dc2626; }
.overdue-info { display: flex; flex-direction: column; gap: 2px; }
.overdue-book { font-size: 13px; font-weight: 500; color: #222; }
.overdue-member { font-size: 11px; color: #888; }
.overdue-days { font-size: 12px; font-weight: 600; color: #dc2626; background: #fee2e2; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
</style>