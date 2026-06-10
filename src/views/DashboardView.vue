<template>
  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">Dashboard</h1>
        <span class="page-date">{{ currentDate }}</span>
      </div>
    </header>

    <!-- ════════════════════════════════════
         ADMIN DASHBOARD
    ════════════════════════════════════ -->
    <template v-if="userRole === 'admin'">
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

      <div class="content-row">
        <div class="panel">
          <div class="panel-header">
            <h2>Recent Borrowings</h2>
            <RouterLink to="/borrowings" class="see-all">See all →</RouterLink>
          </div>
          <div v-if="borrowingsLoading" class="loading"><div class="spinner"></div> Loading...</div>
          <div v-else-if="recentBorrowings.length === 0" class="empty">No borrowings yet</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Book</th><th>Due Date</th><th>Status</th></tr>
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
        <div class="panel overdue-panel">
          <div class="panel-header">
            <h2>Overdue Books</h2>
            <span class="overdue-count">{{ overdueList.length }}</span>
          </div>
          <div v-if="overdueLoading" class="loading"><div class="spinner"></div> Loading...</div>
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
    </template>

    <!-- ════════════════════════════════════
         AUTHOR DASHBOARD
    ════════════════════════════════════ -->
    <template v-else-if="userRole === 'author'">

      <!-- Author Stats -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">My Books</span>
            <span class="stat-value">{{ authorLoading ? '...' : authorBooks.length }}</span>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">Times Borrowed</span>
            <span class="stat-value">{{ authorLoading ? '...' : totalBorrows }}</span>
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">Available Copies</span>
            <span class="stat-value">{{ authorLoading ? '...' : totalAvailable }}</span>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">Most Borrowed</span>
            <span class="stat-value-sm">{{ authorLoading ? '...' : (mostBorrowedBook?.title || '—') }}</span>
          </div>
        </div>
      </div>

      <!-- Author Content -->
      <div class="content-row">

        <!-- My Books Table -->
        <div class="panel">
          <div class="panel-header">
            <h2>My Books</h2>
            <RouterLink to="/books" class="see-all">Manage →</RouterLink>
          </div>
          <div v-if="authorLoading" class="loading"><div class="spinner"></div> Loading...</div>
          <div v-else-if="authorBooks.length === 0" class="empty">You haven't added any books yet</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Genre</th><th>Copies</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr v-for="book in authorBooks" :key="book.id" class="clickable-row"
                    @click="router.push('/books/' + book.id)">
                  <td>
                    <div class="book-title-cell">
                      <div class="book-thumb">
                        <img v-if="book.cover_image" :src="book.cover_image" :alt="book.title" />
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </div>
                      <div>
                        <span class="book-name">{{ book.title }}</span>
                        <span class="book-isbn">{{ book.isbn }}</span>
                      </div>
                    </div>
                  </td>
                  <td><span v-if="book.genre" class="genre-chip">{{ book.genre }}</span><span v-else class="text-muted">—</span></td>
                  <td>
                    <span class="copies-cell">
                      <span class="copies-avail">{{ book.available_copies }}</span>
                      <span class="copies-sep">/</span>
                      <span class="copies-total">{{ book.total_copies }}</span>
                    </span>
                  </td>
                  <td><span class="badge" :class="book.is_available ? 'active' : 'unavailable'">{{ book.is_available ? 'Available' : 'Unavailable' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right column -->
        <div class="right-col">

          <!-- Borrow Activity -->
          <div class="panel">
            <div class="panel-header">
              <h2>Borrow Activity</h2>
            </div>
            <div v-if="authorLoading" class="loading"><div class="spinner"></div></div>
            <div v-else-if="authorBorrowings.length === 0" class="empty">No borrowings yet</div>
            <div v-else class="borrow-activity">
              <div class="activity-item" v-for="b in authorBorrowings" :key="b.id">
                <div class="activity-left">
                  <div class="activity-avatar">{{ initial(b.member?.name) }}</div>
                  <div class="activity-info">
                    <span class="activity-member">{{ b.member?.name || '—' }}</span>
                    <span class="activity-book">{{ b.book?.title || '—' }}</span>
                  </div>
                </div>
                <div class="activity-right">
                  <span class="badge" :class="b.status">{{ b.status }}</span>
                  <span class="activity-date">{{ formatDate(b.due_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div class="panel tips-panel">
            <div class="panel-header">
              <h2>Quick Actions</h2>
            </div>
            <div class="tips-list">
              <RouterLink to="/books" class="tip-item">
                <div class="tip-icon blue-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span>Add a new book</span>
                <svg class="tip-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </RouterLink>
              <RouterLink to="/books" class="tip-item">
                <div class="tip-icon green-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <span>Edit my books</span>
                <svg class="tip-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </RouterLink>
              <RouterLink to="/borrowings" class="tip-item">
                <div class="tip-icon amber-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span>View borrow history</span>
                <svg class="tip-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════
         MEMBER DASHBOARD
    ════════════════════════════════════ -->
    <template v-else-if="userRole === 'member'">
      <div class="stats-grid member-stats">
        <div class="stat-card blue">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">My Borrowings</span>
            <span class="stat-value">{{ memberLoading ? '...' : memberBorrowings.length }}</span>
          </div>
        </div>
        <div class="stat-card red">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">Overdue</span>
            <span class="stat-value">{{ memberLoading ? '...' : memberOverdue }}</span>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-body">
            <span class="stat-label">Returned</span>
            <span class="stat-value">{{ memberLoading ? '...' : memberReturned }}</span>
          </div>
        </div>
      </div>
      <div class="content-row">
        <div class="panel">
          <div class="panel-header">
            <h2>My Current Borrowings</h2>
            <RouterLink to="/borrowings" class="see-all">See all →</RouterLink>
          </div>
          <div v-if="memberLoading" class="loading"><div class="spinner"></div> Loading...</div>
          <div v-else-if="memberBorrowings.length === 0" class="empty">No active borrowings</div>
          <div v-else class="table-wrap">
            <table>
              <thead><tr><th>Book</th><th>Borrowed</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                <tr v-for="b in memberBorrowings" :key="b.id">
                  <td class="book-cell">{{ b.book?.title || '—' }}</td>
                  <td>{{ formatDate(b.borrowed_date) }}</td>
                  <td :class="{ 'text-red': b.status === 'overdue' }">{{ formatDate(b.due_date) }}</td>
                  <td><span class="badge" :class="b.status">{{ b.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h2>Quick Actions</h2></div>
          <div class="tips-list">
            <RouterLink to="/books" class="tip-item">
              <div class="tip-icon blue-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <span>Browse books</span>
              <svg class="tip-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
            <RouterLink to="/borrowings" class="tip-item">
              <div class="tip-icon amber-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span>My borrowing history</span>
              <svg class="tip-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

// ── Shared ──────────────────────────────────────────────
const userRole = ref('')
const currentUser = ref(null)

const stats = ref({ total_books: 0, total_authors: 0, total_members: 0, overdue_borrowings: 0 })
const statsLoading = ref(true)

// ── Admin ────────────────────────────────────────────────
const recentBorrowings  = ref([])
const overdueList       = ref([])
const borrowingsLoading = ref(true)
const overdueLoading    = ref(true)

// ── Author ───────────────────────────────────────────────
const authorBooks      = ref([])
const authorBorrowings = ref([])
const authorLoading    = ref(true)

const totalBorrows = computed(() =>
  authorBooks.value.reduce((sum, b) => sum + (b.total_copies - b.available_copies), 0)
)
const totalAvailable = computed(() =>
  authorBooks.value.reduce((sum, b) => sum + b.available_copies, 0)
)
const mostBorrowedBook = computed(() => {
  if (!authorBooks.value.length) return null
  return [...authorBooks.value].sort(
    (a, b) => (b.total_copies - b.available_copies) - (a.total_copies - a.available_copies)
  )[0]
})

// ── Member ───────────────────────────────────────────────
const memberBorrowings = ref([])
const memberLoading    = ref(true)
const memberOverdue  = computed(() => memberBorrowings.value.filter(b => b.status === 'overdue').length)
const memberReturned = computed(() => memberBorrowings.value.filter(b => b.status === 'returned').length)

// ── Fetch ────────────────────────────────────────────────
const fetchUser = async () => {
  try {
    const res = await api.get('/auth/me')
    console.log(JSON.stringify(res.data, null, 2))
    currentUser.value = res.data
    userRole.value = res.data.role
  } catch { userRole.value = 'guest' }
}

const fetchStats = async () => {
  // statistics endpoint للـ admin بس
  if (userRole.value !== 'admin') {
    statsLoading.value = false
    return
  }
  try {
    const res = await api.get('/statistics')
    stats.value = res.data
  } catch {}
  finally { statsLoading.value = false }
}

const fetchAdminData = async () => {
  try {
    const res = await api.get('/borrowings?page=1')
    recentBorrowings.value = (res.data.data || res.data).slice(0, 5)
  } catch {}
  finally { borrowingsLoading.value = false }

  try {
    const res = await api.get('/borrowings/overdue/list')
    overdueList.value = (res.data.data || res.data).slice(0, 5)
  } catch {}
  finally { overdueLoading.value = false }
}

const fetchAuthorData = async () => {
  try {
    // ✅ استخدم الـ endpoint الجاهز
    const res = await api.get('/my-books')
    authorBooks.value = res.data.data || res.data
    console.log('authorBooks:', authorBooks.value)

    // جيب الـ borrowings من كتب الـ author
    try {
      const borrowRes = await api.get('/borrowings?page=1')
      const allBorrowings = borrowRes.data.data || borrowRes.data
      const myBookIds = new Set(authorBooks.value.map(b => b.id))
      authorBorrowings.value = allBorrowings
        .filter(b => myBookIds.has(b.book?.id))
        .slice(0, 6)
    } catch {
      authorBorrowings.value = []
    }

  } catch(e) {
    console.error('fetchAuthorData error:', e)
  } finally {
    authorLoading.value = false
  }
}

const fetchMemberData = async () => {
  try {
    const res = await api.get('/borrowings?page=1')
    memberBorrowings.value = res.data.data || res.data
  } catch {}
  finally { memberLoading.value = false }
}

// ── Helpers ──────────────────────────────────────────────
const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'

const daysSince = (d) => {
  if (!d) return 0
  return Math.max(0, Math.floor((new Date() - new Date(d)) / 86400000))
}

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

onMounted(async () => {
  await fetchUser()
  fetchStats()
  if (userRole.value === 'admin')       fetchAdminData()
  else if (userRole.value === 'author') fetchAuthorData()
  else if (userRole.value === 'member') fetchMemberData()
})
</script>

<style scoped>
.main { padding: 36px 40px; min-height: 100vh; }

.topbar { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 36px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #141414; line-height: 1; }
.page-date { font-size: 13px; color: #888; margin-top: 6px; display: block; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
.stats-grid.member-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.stat-card {
  background: white; border-radius: 18px; padding: 26px 22px;
  display: flex; align-items: center; gap: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
.stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-card.blue   .stat-icon { background: #dbeafe; color: #2563eb; }
.stat-card.green  .stat-icon { background: #dcfce7; color: #16a34a; }
.stat-card.amber  .stat-icon { background: #fef9c3; color: #ca8a04; }
.stat-card.red    .stat-icon { background: #fee2e2; color: #dc2626; }
.stat-card.purple .stat-icon { background: #ede9fe; color: #7c3aed; }
.stat-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.stat-label { font-size: 13px; color: #888; }
.stat-value { font-size: 34px; font-weight: 600; color: #141414; line-height: 1.2; margin-top: 4px; }
.stat-value-sm { font-size: 14px; font-weight: 600; color: #141414; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Layout */
.content-row { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.right-col { display: flex; flex-direction: column; gap: 20px; }

/* Panel */
.panel { background: white; border-radius: 18px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.panel-header h2 { font-size: 16px; font-weight: 600; color: #141414; }
.see-all { font-size: 13px; color: #c9a96e; text-decoration: none; font-weight: 500; }

/* Loading / Empty */
.loading { display: flex; align-items: center; gap: 8px; padding: 24px; color: #888; font-size: 13px; justify-content: center; }
.spinner { width: 16px; height: 16px; border: 2px solid #e8e8e8; border-top-color: #c9a96e; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty { text-align: center; color: #bbb; padding: 32px; font-size: 14px; }

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 11px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
td { padding: 13px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; transition: background 0.15s; }
.clickable-row:hover { background: #fafaf8; }
.book-cell { color: #555; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-red { color: #dc2626; font-weight: 500; }
.text-muted { color: #ccc; }

.member-cell { display: flex; align-items: center; gap: 8px; }
.member-avatar { width: 26px; height: 26px; background: #c9a96e22; color: #c9a96e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }

/* Book title cell */
.book-title-cell { display: flex; align-items: center; gap: 10px; }
.book-thumb { width: 30px; height: 40px; border-radius: 5px; background: #f0ede8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; color: #c9a96e; }
.book-thumb img { width: 100%; height: 100%; object-fit: cover; }
.book-name { display: block; font-weight: 500; color: #141414; font-size: 13px; }
.book-isbn { display: block; font-size: 11px; color: #aaa; font-family: monospace; }

.copies-cell { display: flex; align-items: center; gap: 2px; }
.copies-avail { font-weight: 600; color: #16a34a; font-size: 13px; }
.copies-sep { color: #ccc; }
.copies-total { color: #888; font-size: 13px; }

.genre-chip { font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #f0ede8; color: #555; font-weight: 500; }

/* Badges */
.badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; }
.badge.borrowed    { background: #dbeafe; color: #2563eb; }
.badge.active      { background: #dcfce7; color: #16a34a; }
.badge.overdue     { background: #fee2e2; color: #dc2626; }
.badge.returned    { background: #f0f0f0; color: #666; }
.badge.unavailable { background: #fee2e2; color: #dc2626; }

/* Overdue */
.overdue-count { background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.overdue-list { display: flex; flex-direction: column; gap: 12px; }
.overdue-item { display: flex; align-items: center; justify-content: space-between; padding: 14px; background: #fafafa; border-radius: 12px; border-left: 3px solid #dc2626; }
.overdue-info { display: flex; flex-direction: column; gap: 2px; }
.overdue-book { font-size: 13px; font-weight: 500; color: #222; }
.overdue-member { font-size: 11px; color: #888; }
.overdue-days { font-size: 12px; font-weight: 600; color: #dc2626; background: #fee2e2; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }

/* Borrow activity */
.borrow-activity { display: flex; flex-direction: column; gap: 10px; }
.activity-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #fafafa; }
.activity-left { display: flex; align-items: center; gap: 10px; }
.activity-avatar { width: 30px; height: 30px; border-radius: 50%; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.activity-info { display: flex; flex-direction: column; }
.activity-member { font-size: 13px; font-weight: 500; color: #222; }
.activity-book { font-size: 11px; color: #888; }
.activity-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.activity-date { font-size: 11px; color: #aaa; }

/* Quick actions */
.tips-panel { }
.tips-list { display: flex; flex-direction: column; gap: 8px; }
.tip-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #fafafa; text-decoration: none; color: #333; font-size: 13px; font-weight: 500; transition: background 0.15s; }
.tip-item:hover { background: #f0f0f0; }
.tip-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.blue-icon  { background: #dbeafe; color: #2563eb; }
.green-icon { background: #dcfce7; color: #16a34a; }
.amber-icon { background: #fef9c3; color: #ca8a04; }
.tip-arrow { margin-left: auto; color: #ccc; }
</style>
