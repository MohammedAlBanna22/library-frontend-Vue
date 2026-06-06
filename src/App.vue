<template>
  <div class="app-root">
    <!-- Sidebar: تظهر بس لما يكون مسجل دخول -->
    <aside v-if="isAuthenticated" class="sidebar">
      <div class="brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="brand-name"> Library</span>
       
      </div>

      <nav class="nav">

        <RouterLink to="/home" class="nav-item" active-class="active">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 10.5L12 3l9 7.5"></path>
          <path d="M5 9.5V21h14V9.5"></path>
          <path d="M9 21v-6h6v6"></path>
          </svg>
          <span>Home</span>
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'|| userRole === 'author'" to="/dashboard" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink v-if="userRole === 'admin' || userRole === 'member'" to="/books" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>Books</span>
        </RouterLink>

        <RouterLink  v-if="userRole === 'admin' " to="/members" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Members</span>
        </RouterLink>

        <RouterLink to="/borrowings" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          <span>Borrowings</span>
        </RouterLink>

        <RouterLink v-if="userRole == 'admin'" to="/authors" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Authors</span>
        </RouterLink>
        <RouterLink v-if="userRole === 'author'" to="/author-books" class="nav-item" active-class="active">
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
  <span>Author Books</span>
</RouterLink>

        <RouterLink v-if="userRole === 'member' " to="/author-requests" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Author Requests</span>
          <span v-if="pendingCount > 0" class="nav-badge">{{ pendingCount }}</span>
        </RouterLink>


  <RouterLink v-if="userRole !== 'admin'" to="/profile" class="nav-item" active-class="active">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  <span>My Profile</span>
</RouterLink>


      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <span class="user-name">{{ userName }}</span>
           <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main content -->
<div :class="isAuthenticated ? 'main-content' : 'full-content'">
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" :key="$route.fullPath" />
    </KeepAlive>
  </RouterView>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from './services/api'

const router   = useRouter()
const userName = ref(localStorage.getItem('userName') || 'Admin')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const userRole = ref(localStorage.getItem('userRole') || 'member')
const isAuthenticated = computed(() => !!localStorage.getItem('token'))
const pendingCount = ref(0)

const fetchPending = async () => {
  if (!isAuthenticated.value) return
  try {
    const res = await api.get('/author-requests')
    const data = res.data.data ?? res.data
    pendingCount.value = data.filter(r => r.status === 'pending').length
  } catch {}
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => fetchPending())
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background: #f0ede8;
  color: #1a1a1a;
}

.app-root {    display: flex;
  min-height: 100vh;
  background: #f0ede8; }

/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
 width: 240px;
  height: 100vh;
  background: #141414;

  display: flex;
  flex-direction: column;

  padding: 24px 16px;
  flex-shrink: 0;

  position: fixed;
  left: 0;
  top: 0;
}

.brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 8px; margin-bottom: 36px;
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
  font-size: 20px; color: #f5f0e8; letter-spacing: 0.5px;
}

.nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  color: #666; text-decoration: none;
  font-size: 14px; font-weight: 400;
  transition: all 0.15s; position: relative;
}
.nav-item:hover { background: #222; color: #ccc; }
.nav-item.active { background: #c9a96e22; color: #c9a96e; }

.nav-badge {
  margin-left: auto;
  background: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
}

.sidebar-footer {
  display: flex; align-items: center; gap: 8px;
  padding: 12px; border-top: 1px solid #222; margin-top: 16px;
}
.avatar {
  width: 34px; height: 34px; background: #c9a96e;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px; color: #141414; flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.user-name { font-size: 13px; color: #ddd; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: #555; }
.logout-btn {
  background: none; border: none; color: #555; cursor: pointer;
  padding: 6px; border-radius: 6px; transition: all 0.15s; display: flex;
}
.logout-btn:hover { color: #e74c3c; background: #1f1f1f; }

/* ── Main content ───────────────────────────────── */
.main-content {
 flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  overflow-x: auto;
  padding: 0;
}
.full-content {  flex: 1;
  min-height: 100vh; }

/* ── Global Buttons ─────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: #141414;
  color: white;
  border: none; border-radius: 10px;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) {
  background: #2d2d2d;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transform: translateY(-1px);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary.gold {
  background: linear-gradient(135deg, #c9a96e, #b8924a);
  color: #141414;
  font-weight: 600;
}
.btn-primary.gold:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4b87a, #c9a96e);
  box-shadow: 0 4px 16px rgba(201,169,110,0.35);
}

.btn-secondary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: white; color: #333;
  border: 1px solid #e0e0e0; border-radius: 10px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #f5f5f5; border-color: #ccc; }

.btn-danger {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: #dc2626; color: white;
  border: none; border-radius: 10px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  box-shadow: 0 4px 12px rgba(220,38,38,0.3);
  transform: translateY(-1px);
}
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>