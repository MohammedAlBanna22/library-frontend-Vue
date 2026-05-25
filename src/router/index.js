import { createRouter, createWebHistory } from 'vue-router'

// Views
import LoginView    from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import BooksView    from '../views/BooksView.vue'
import MembersView  from '../views/MembersView.vue'
import BorrowingsView from '../views/BorrowingsView.vue'
import AuthorsView  from '../views/AuthorsView.vue'
import AuthorRequestsView from '../views/AuthorRequestsView.vue'


const routes = [
  // Public
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: LoginView, meta: { guest: true } },

  // Protected
  { path: '/dashboard',  name: 'Dashboard',  component: DashboardView,  meta: { requiresAuth: true } },
  { path: '/books',      name: 'Books',      component: BooksView,      meta: { requiresAuth: true } },
  { path: '/members',    name: 'Members',    component: MembersView,    meta: { requiresAuth: true } },
  { path: '/borrowings', name: 'Borrowings', component: BorrowingsView, meta: { requiresAuth: true } },
  { path: '/authors',    name: 'Authors',    component: AuthorsView,    meta: { requiresAuth: true } },
  { path: '/author-requests', name: 'AuthorRequests', component: AuthorRequestsView, meta: { requiresAuth: true } },

  // 404
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ─── Auth Guard ───────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  // صفحة محمية بدون token → روّح على login
  if (to.meta.requiresAuth && !token) {
    return { name: 'Login' }
  }

  // عنده token وراح على login → روّح على dashboard
  if (to.meta.guest && token) {
    return { name: 'Dashboard' }
  }
})

export default router