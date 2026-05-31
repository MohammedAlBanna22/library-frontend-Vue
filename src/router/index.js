import { createRouter, createWebHistory } from 'vue-router'

// Views
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import BooksView from '../views/BooksView.vue'
import MembersView from '../views/MembersView.vue'
import BorrowingsView from '../views/BorrowingsView.vue'
import AuthorsView from '../views/AuthorsView.vue'
import AuthorRequestsView from '../views/AuthorRequestsView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import BookDetailView from '../views/BookDetailView.vue'
import MemberProfile from '../views/MemberProfile.vue'
import CompleteProfileView from '../views/CompleteProfileView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login',          name: 'Login',          component: LoginView,          meta: { guest: true } },
  { path: '/dashboard',      name: 'Dashboard',      component: DashboardView,      meta: { requiresAuth: true } },
  { path: '/books',          name: 'Books',          component: BooksView,          meta: { requiresAuth: true } },
  { path: '/books/:id',      name: 'BookDetail',     component: BookDetailView,     meta: { requiresAuth: true } },
  { path: '/members',        name: 'Members',        component: MembersView,        meta: { requiresAuth: true } },
  { path: '/borrowings',     name: 'Borrowings',     component: BorrowingsView,     meta: { requiresAuth: true } },
  { path: '/authors',        name: 'Authors',        component: AuthorsView,        meta: { requiresAuth: true } },
  { path: '/author-requests',name: 'AuthorRequests', component: AuthorRequestsView, meta: { requiresAuth: true } },
  { path: '/reset-password', name: 'ResetPassword',  component: ResetPasswordView,  meta: { guest: true } },
  { path: '/profile',        name: 'MemberProfile',  component: MemberProfile,      meta: { requiresAuth: true } },
  { path: '/complete-profile', name: 'CompleteProfile', component: CompleteProfileView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ─── Auth Guard ───────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) return { name: 'Login' }
  if (to.meta.guest && token) return { name: 'Dashboard' }
})

export default router