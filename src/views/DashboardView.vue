<template>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="brand-name">Librari</span>
      </div>

      <nav class="nav">
        <RouterLink to="/dashboard" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/books" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>Books</span>
        </RouterLink>
        <RouterLink to="/members" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Members</span>
        </RouterLink>
        <RouterLink to="/borrowings" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          <span>Borrowings</span>
        </RouterLink>
        <RouterLink to="/authors" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Authors</span>
        </RouterLink>
        <RouterLink to="/author-requests" class="nav-item" active-class="active">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Author Requests</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">Admin</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Dashboard</h1>
          <span class="page-date">{{ currentDate }}</span>
        </div>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label" :class="stat.color">
          <div class="stat-icon">
            <span v-html="stat.icon"></span>
          </div>
          <div class="stat-body">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </div>

      <!-- Content row -->
      <div class="content-row">
        <!-- Recent Borrowings -->
        <div class="panel">
          <div class="panel-header">
            <h2>Recent Borrowings</h2>
            <RouterLink to="/borrowings" class="see-all">See all →</RouterLink>
          </div>
          <div class="table-wrap">
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
                  <td>{{ b.member }}</td>
                  <td class="book-cell">{{ b.book }}</td>
                  <td>{{ b.due }}</td>
                  <td><span class="badge" :class="b.status">{{ b.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Overdue -->
        <div class="panel overdue-panel">
          <div class="panel-header">
            <h2>Overdue Books</h2>
            <span class="overdue-count">{{ overdueList.length }}</span>
          </div>
          <div class="overdue-list">
            <div class="overdue-item" v-for="item in overdueList" :key="item.id">
              <div class="overdue-info">
                <span class="overdue-book">{{ item.book }}</span>
                <span class="overdue-member">{{ item.member }}</span>
              </div>
              <span class="overdue-days">{{ item.days }}d late</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const userName = ref(localStorage.getItem('userName') || 'Admin')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const stats = ref([
  { label: 'Total Books', value: 0, trend: 12, color: 'blue',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  { label: 'Members', value: 0, trend: 8, color: 'green',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
  { label: 'Borrowings', value: 0, trend: 5, color: 'amber',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>` },
  { label: 'Overdue', value: 0, trend: -3, color: 'red',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
])

const recentBorrowings = ref([
  { id: 1, member: 'Ahmed Ali', book: 'Clean Code', due: '2025-06-01', status: 'active' },
  { id: 2, member: 'Sara Hassan', book: 'The Pragmatic', due: '2025-05-20', status: 'overdue' },
  { id: 3, member: 'Omar Khalid', book: 'Design Patterns', due: '2025-06-10', status: 'active' },
  { id: 4, member: 'Lina Nasser', book: 'Refactoring', due: '2025-05-28', status: 'returned' },
])

const overdueList = ref([
  { id: 1, book: 'The Pragmatic Programmer', member: 'Sara Hassan', days: 4 },
  { id: 2, book: 'Introduction to Algorithms', member: 'Khalid Musa', days: 9 },
  { id: 3, book: 'You Don\'t Know JS', member: 'Rania Faris', days: 2 },
])

onMounted(async () => {
  try {
    const res = await api.get('/statistics')
    if (res.data) {
      stats.value[0].value = res.data.books || 0
      stats.value[1].value = res.data.members || 0
      stats.value[2].value = res.data.borrowings || 0
      stats.value[3].value = res.data.overdue || 0
    }
  } catch (e) {
    // use placeholder data
  }
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f0ede8;
  color: #1a1a1a;
}

/* Sidebar */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #141414;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  margin-bottom: 36px;
}
.brand-icon {
  width: 36px; height: 36px;
  background: #c9a96e;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #141414;
}
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #f5f0e8;
  letter-spacing: 0.5px;
}

.nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.15s;
}
.nav-item:hover { background: #222; color: #ccc; }
.nav-item.active { background: #c9a96e22; color: #c9a96e; }

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #222;
  margin-top: 16px;
}
.avatar {
  width: 34px; height: 34px;
  background: #c9a96e;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px;
  color: #141414;
  flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.user-name { font-size: 13px; color: #ddd; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: #555; }
.logout-btn {
  background: none; border: none; color: #555;
  cursor: pointer; padding: 4px;
  border-radius: 6px; transition: color 0.15s;
  display: flex;
}
.logout-btn:hover { color: #e74c3c; }

/* Main */
.main {
  margin-left: 240px;
  flex: 1;
  padding: 32px;
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 600;
  color: #141414;
  line-height: 1;
}
.page-date {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
  display: block;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card.blue .stat-icon { background: #dbeafe; color: #2563eb; }
.stat-card.green .stat-icon { background: #dcfce7; color: #16a34a; }
.stat-card.amber .stat-icon { background: #fef9c3; color: #ca8a04; }
.stat-card.red .stat-icon { background: #fee2e2; color: #dc2626; }

.stat-body { display: flex; flex-direction: column; flex: 1; }
.stat-label { font-size: 12px; color: #888; font-weight: 400; }
.stat-value { font-size: 26px; font-weight: 600; color: #141414; line-height: 1.2; margin-top: 2px; }

.stat-trend {
  position: absolute;
  top: 16px; right: 16px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 20px;
}
.stat-trend.up { background: #dcfce7; color: #16a34a; }
.stat-trend.down { background: #fee2e2; color: #dc2626; }

/* Content row */
.content-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.panel-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #141414;
}
.see-all {
  font-size: 13px;
  color: #c9a96e;
  text-decoration: none;
  font-weight: 500;
}

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left;
  font-size: 11px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}
td {
  padding: 12px 12px;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #f8f8f8;
}
tr:last-child td { border-bottom: none; }
.book-cell { color: #555; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 20px;
}
.badge.active { background: #dcfce7; color: #16a34a; }
.badge.overdue { background: #fee2e2; color: #dc2626; }
.badge.returned { background: #f0f0f0; color: #666; }

/* Overdue panel */
.overdue-count {
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}
.overdue-list { display: flex; flex-direction: column; gap: 12px; }
.overdue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
  border-left: 3px solid #dc2626;
}
.overdue-info { display: flex; flex-direction: column; gap: 2px; }
.overdue-book { font-size: 13px; font-weight: 500; color: #222; }
.overdue-member { font-size: 11px; color: #888; }
.overdue-days {
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  background: #fee2e2;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}
</style>