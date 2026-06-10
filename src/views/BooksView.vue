<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Books</h1>
        <span class="page-sub">{{ total }} book{{ total !== 1 ? 's' : '' }} total</span>
      </div>
      <button v-if="isAdmin" class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Book
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Search by title, author, genre..." />
        <button v-if="search" class="clear-btn" @click="search = ''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <select v-model="filterGenre" class="filter-select">
        <option value="">All genres</option>
        <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
      </select>

      <select v-model="filterStatus" class="filter-select">
        <option value="">All status</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
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
      <span>Loading books...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredBooks.length" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      <p>No books found</p>
      <button v-if="isAdmin" class="btn-primary" @click="openCreate">Add first book</button>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('title')" class="sortable">
              Title <span class="sort-icon">{{ sortField === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th @click="sortBy('total_copies')" class="sortable">
              Copies <span class="sort-icon">{{ sortField === 'total_copies' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('price')" class="sortable">
              Price <span class="sort-icon">{{ sortField === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in sortedBooks" :key="book.id" class="table-row" 
            @click="router.push('/books/' + book.id)"
            style="cursor:pointer">
            <td>
              <div class="book-title-cell">
                <div class="book-cover">
                  <img v-if="book.cover_image" :src="book.cover_image" :alt="book.title" />
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div>
                  <span class="book-name">{{ book.title }}</span>
                  <span class="book-date" v-if="book.published_at">{{ formatYear(book.published_at) }}</span>
                </div>
              </div>
            </td>
            <td class="author-cell">{{ book.author?.name || '—' }}</td>
            <td>
              <span v-if="book.genre" class="genre-badge">{{ book.genre }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="isbn-cell">{{ book.isbn }}</td>
            <td>
              <span class="copies-info">
                <span class="available-copies">{{ book.available_copies }}</span>
                <span class="copies-sep">/</span>
                <span class="total-copies">{{ book.total_copies }}</span>
              </span>
            </td>
            <td>{{ book.price ? '$' + Number(book.price).toFixed(2) : '—' }}</td>
            <td>
              <span class="badge" :class="book.is_available ? 'available' : 'unavailable'">
                {{ book.is_available ? 'Available' : 'Unavailable' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <!-- BORROW - MEMBERS ONLY -->
                <button
                  v-if="isMember"
                  class="btn-action btn-borrow"
                  @click.stop="openBorrowModal(book)"
                  :disabled="!book.is_available || hasActiveBorrowing(book.id)"
                  :class="{
                    'is-disabled': !book.is_available,
                    'in-progress': book.is_available && hasActiveBorrowing(book.id)
                  }"
                  :title="getButtonTooltip(book)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 3 21 3 21 8"/>
                    <line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/>
                  </svg>
                  {{ getButtonLabel(book) }}
                </button>

                <!-- EDIT - ADMIN & AUTHOR (OWN BOOK) -->
                <button
                  v-if="canEdit(book)"
                  class="action-btn edit"
                  @click.stop="openEdit(book)"
                  title="Edit book"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>

                <!-- DELETE - ADMIN ONLY -->
                <button
                  v-if="isAdmin"
                  class="action-btn delete"
                  @click.stop="confirmDelete(book)"
                  title="Delete book"
                >
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
      <div v-for="book in sortedBooks" :key="book.id" class="book-card"
        @click="router.push('/books/' + book.id)"
        style="cursor:pointer">
        <div class="card-cover">
          <img v-if="book.cover_image" :src="book.cover_image" :alt="book.title" />
          <div v-else class="cover-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="card-actions-overlay">
            <button v-if="canEdit(book)" class="action-btn edit" @click.stop="openEdit(book)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button v-if="isAdmin" class="action-btn delete" @click.stop="confirmDelete(book)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-top">
            <span v-if="book.genre" class="genre-badge">{{ book.genre }}</span>
            <span class="badge" :class="book.is_available ? 'available' : 'unavailable'">
              {{ book.is_available ? 'Available' : 'Unavailable' }}
            </span>
          </div>
          <h3 class="card-title">{{ book.title }}</h3>
          <p class="card-author">{{ book.author?.name || 'Unknown Author' }}</p>
          <p class="card-desc">{{ book.description || 'No description available.' }}</p>
          <div class="card-footer">
            <span class="copies-info">
              <span class="available-copies">{{ book.available_copies }}</span>/<span class="total-copies">{{ book.total_copies }}</span> copies
            </span>
            <span class="card-price">{{ book.price ? '$' + Number(book.price).toFixed(2) : 'Free' }}</span>
          </div>
          <button
            v-if="isMember"
            class="btn-action btn-borrow-card"
            @click.stop="openBorrowModal(book)"
            :disabled="!book.is_available || hasActiveBorrowing(book.id)"
            :class="{
              'is-disabled': !book.is_available,
              'in-progress': book.is_available && hasActiveBorrowing(book.id)
            }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/></svg>
            {{ getButtonLabel(book) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">← Prev</button>
      <span class="page-info">Page {{ currentPage }} of {{ lastPage }}</span>
      <button class="page-btn" :disabled="currentPage === lastPage" @click="goPage(currentPage + 1)">Next →</button>
    </div>

   <!-- Add/Edit Modal -->
<Teleport to="body">
  <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h2>{{ editingId ? 'Edit Book' : 'Add Book' }}</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form @submit.prevent="submitForm" class="modal-body">
        <div class="form-grid">
          <div class="field span-2">
            <label>Title <span class="required">*</span></label>
            <input v-model="form.title" type="text" placeholder="Book title" required />
            <span v-if="errors.title" class="field-error">{{ errors.title[0] }}</span>
          </div>

          <div v-if="isAdmin" class="field">
            <label>Author</label>
            <select v-model="form.author_id">
              <option value="">Select author...</option>
              <option v-for="a in authors" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
            <span v-if="errors.author_id" class="field-error">{{ errors.author_id[0] }}</span>
          </div>

          <div class="field">
            <label>ISBN <span class="required">*</span></label>
            <input v-model="form.isbn" type="text" placeholder="e.g. 978-3-16-148410-0" required />
            <span v-if="errors.isbn" class="field-error">{{ errors.isbn[0] }}</span>
          </div>

          <div class="field">
            <label>Genre</label>
            <input v-model="form.genre" type="text" placeholder="e.g. Fiction, Science..." />
            <span v-if="errors.genre" class="field-error">{{ errors.genre[0] }}</span>
          </div>

          <div class="field">
            <label>Published At</label>
            <input v-model="form.published_at" type="date" />
            <span v-if="errors.published_at" class="field-error">{{ errors.published_at[0] }}</span>
          </div>

          <div class="field">
            <label>Total Copies <span class="required">*</span></label>
            <input v-model.number="form.total_copies" type="number" min="1" placeholder="1" required />
            <span v-if="errors.total_copies" class="field-error">{{ errors.total_copies[0] }}</span>
          </div>

          <div class="field">
            <label>Price</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="0.00" />
            <span v-if="errors.price" class="field-error">{{ errors.price[0] }}</span>
          </div>

          <div class="field span-2">
            <label>Cover Image URL</label>
            <input v-model="form.cover_image" type="text" placeholder="https://..." />
            <span v-if="errors.cover_image" class="field-error">{{ errors.cover_image[0] }}</span>
          </div>

          <div class="field span-2">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Book description..."></textarea>
            <span v-if="errors.description" class="field-error">{{ errors.description[0] }}</span>
          </div>
        </div>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Book') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</Teleport>

    <!-- Borrow Modal -->
<Teleport to="body">
  <div v-if="showBorrowModal" class="modal-backdrop" @click.self="closeBorrowModal">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2>Borrow Book</h2>
        <button class="close-btn" @click="closeBorrowModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form @submit.prevent="submitBorrow" class="modal-body">
        <div v-if="borrowingBook" class="borrow-book-info">
          <p><strong>{{ borrowingBook.title }}</strong></p>
          <p class="book-author">by {{ borrowingBook.author?.name || 'Unknown Author' }}</p>
        </div>

        <div class="form-grid">
          <div class="field span-2">
            <label>Borrowed Date <span class="required">*</span></label>
            <input v-model="borrowForm.borrowed_date" type="date" required />
            <span v-if="errors.borrowed_date" class="field-error">{{ errors.borrowed_date[0] }}</span>
          </div>
          <div class="field span-2">
            <label>Due Date <span class="required">*</span></label>
            <input v-model="borrowForm.due_date" type="date" required />
            <span v-if="errors.due_date" class="field-error">{{ errors.due_date[0] }}</span>
          </div>
        </div>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeBorrowModal">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Borrowing...' : 'Confirm Borrow' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Delete Book</h2>
            <button class="close-btn" @click="showDeleteConfirm = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">Are you sure you want to delete <strong>{{ deletingBook?.title }}</strong>? This action cannot be undone.</p>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
              <button class="btn-danger" :disabled="submitting" @click="deleteBook">
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
import { useRouter } from 'vue-router' 
import api from '../services/api'

const router = useRouter() 
const books        = ref([])
const authors      = ref([])
const loading      = ref(false)
const search       = ref('')
const filterGenre  = ref('')
const filterStatus = ref('')
const viewMode     = ref('table')
const currentPage  = ref(1)
const lastPage     = ref(1)
const total        = ref(0)
const sortField    = ref('title')
const sortDir      = ref('asc')

// 👤 User
const currentUser = ref(null)

// ✨ Member's active borrowings
const memberBorrowings = ref([])

// Modal
const showModal  = ref(false)
const editingId  = ref(null)
const submitting = ref(false)
const formError  = ref('')
const errors     = ref({})
const form       = ref({
  title: '', isbn: '', description: '', author_id: '',
  genre: '', published_at: '', total_copies: 1,
  price: '', cover_image: ''
})

// Borrow
const showBorrowModal = ref(false)
const borrowingBook = ref(null)
const borrowForm = ref({
  borrowed_date: new Date().toISOString().split('T')[0],
  due_date: ''
})

// Delete
const showDeleteConfirm = ref(false)
const deletingBook = ref(null)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

// ═══════════════════════════════════════════════════════════
// PERMISSIONS
// ═══════════════════════════════════════════════════════════

const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isMember = computed(() => currentUser.value?.role === 'member')
const isAuthor = computed(() => currentUser.value?.role === 'author')

const canEdit = (book) => {
  // Admin can edit all
  if (isAdmin.value) return true
  // Author can edit own books
  if (isAuthor.value && book.author?.id === currentUser.value?.id) return true
  return false
}

// ═══════════════════════════════════════════════════════════
// CHECK ACTIVE BORROWING
// ═══════════════════════════════════════════════════════════

// ✨ تحقق من وجود استعارة نشطة للكتاب
const hasActiveBorrowing = (bookId) => {
  return memberBorrowings.value.some(b => {
    // جرّب book_id أولاً، ثم book.id إذا كان book object
    return b.book_id === bookId || b.book?.id === bookId
  })
}

// ✨ احصل على نص الزر المناسب
const getButtonLabel = (book) => {
  if (!book.is_available) return 'Not Available'
  if (hasActiveBorrowing(book.id)) return 'In Progress'
  return 'Borrow'
}

// ✨ احصل على tooltip المناسب
const getButtonTooltip = (book) => {
  if (hasActiveBorrowing(book.id)) {
    return 'You already borrowed this book. Return it first before borrowing again.'
  }
  if (!book.is_available) {
    return 'This book is not available for borrowing'
  }
  return 'Borrow this book'
}

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const genres = computed(() => {
  const all = books.value.map(b => b.genre).filter(Boolean)
  return [...new Set(all)].sort()
})

const filteredBooks = computed(() => {
  let list = books.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.name?.toLowerCase().includes(q) ||
      b.genre?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q)
    )
  }
  if (filterGenre.value) {
    list = list.filter(b => b.genre === filterGenre.value)
  }
  if (filterStatus.value === 'available') {
    list = list.filter(b => b.is_available)
  } else if (filterStatus.value === 'unavailable') {
    list = list.filter(b => !b.is_available)
  }
  return list
})

const sortedBooks = computed(() => {
  return [...filteredBooks.value].sort((a, b) => {
    const aVal = a[sortField.value] ?? ''
    const bVal = b[sortField.value] ?? ''
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

const fetchCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me')
    currentUser.value = res.data
  } catch {
    currentUser.value = { id: null, role: 'guest' }
  }
}

// ✨ احصل على الاستعارات النشطة للعضو الحالي
const fetchMemberBorrowings = async () => {
  if (!isMember.value) return
  try {
    const res = await api.get('/borrowings')
    
    let borrowings = res.data.data ?? res.data ?? []
    
    if (!Array.isArray(borrowings)) {
      borrowings = []
    }
    
    // احفظ فقط الاستعارات النشطة (borrowed أو overdue)
    memberBorrowings.value = borrowings.filter(b => {
      return b.status === 'borrowed' || b.status === 'overdue'
    })
    
    console.log('✅ Member Active Borrowings:', memberBorrowings.value.map(b => ({
      borrowing_id: b.id,
      book_id: b.book?.id,
      book_title: b.book?.title,
      status: b.status
    })))
  } catch (error) {
    console.error('❌ Error fetching borrowings:', error)
    memberBorrowings.value = []
  }
}

const fetchBooks = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get('/books', { params: { page } })
    const data = res.data
    if (data.data && Array.isArray(data.data)) {
      books.value = data.data
      currentPage.value = data.meta?.current_page ?? 1
      lastPage.value = data.meta?.last_page ?? 1
      total.value = data.meta?.total ?? data.data.length
    } else if (Array.isArray(data)) {
      books.value = data
      total.value = data.length
    }
  } catch {
    showToast('Failed to load books', 'error')
  } finally {
    loading.value = false
  }
}

const fetchAuthors = async () => {
  if (!isAdmin.value) return
  try {
    const res = await api.get('/authors')
    authors.value = res.data.data ?? res.data
  } catch {}
}

const goPage = (page) => {
  currentPage.value = page
  fetchBooks(page)
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

const formatYear = (date) => date ? new Date(date).getFullYear() : ''

const openCreate = () => {
  editingId.value = null
  form.value = { title: '', isbn: '', description: '', author_id: '', genre: '', published_at: '', total_copies: 1, price: '', cover_image: '' }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const openEdit = (book) => {
  editingId.value = book.id
  form.value = {
    title: book.title ?? '',
    isbn: book.isbn ?? '',
    description: book.description ?? '',
    author_id: book.author?.id ?? '',
    genre: book.genre ?? '',
    published_at: book.published_at ? book.published_at.split('T')[0] : '',
    total_copies: book.total_copies ?? 1,
    price: book.price ?? '',
    cover_image: book.cover_image ?? '',
  }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true
  errors.value = {}
  formError.value = ''
  try {
    const payload = { ...form.value }
    if (!payload.author_id) delete payload.author_id
    if (editingId.value) {
      await api.put(`/books/${editingId.value}`, payload)
      showToast('Book updated successfully')
    } else {
      await api.post('/books', payload)
      showToast('Book added successfully')
    }
    closeModal()
    fetchBooks()
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

const openBorrowModal = (book) => {
  borrowingBook.value = book
  borrowForm.value = {
    borrowed_date: new Date().toISOString().split('T')[0],
    due_date: ''
  }
  errors.value = {}
  formError.value = ''
  showBorrowModal.value = true
}

const closeBorrowModal = () => {
  showBorrowModal.value = false
  borrowingBook.value = null
}

const submitBorrow = async () => {
  if (!borrowForm.value.borrowed_date || !borrowForm.value.due_date) {
    formError.value = 'Please fill all fields'
    return
  }
  submitting.value = true
  try {
    await api.post('/borrowings', {
      book_id: borrowingBook.value.id,
      ...borrowForm.value,
      status: 'borrowed'
    })
    closeBorrowModal()
    showToast('Book borrowed successfully!')
    // ✨ حدّث الاستعارات النشطة بعد الاستعارة الناجحة
    await fetchMemberBorrowings()
    await fetchBooks(currentPage.value)
  } catch (e) {
    formError.value = e.response?.data?.message || 'Failed to borrow book'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (book) => {
  deletingBook.value = book
  showDeleteConfirm.value = true
}

const deleteBook = async () => {
  submitting.value = true
  try {
    await api.delete(`/books/${deletingBook.value.id}`)
    showDeleteConfirm.value = false
    showToast('Book deleted')
    fetchBooks()
  } catch (e) {
    showToast(e.response?.data?.message || 'Failed to delete book', 'error')
  } finally {
    submitting.value = false
  }
}

const showToast = (message, type = 'success') => {
  clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchBooks(1)
  await fetchMemberBorrowings()  // ✨ احصل على الاستعارات النشطة
  await fetchAuthors()
})

onActivated(() => {
  fetchBooks(currentPage.value)
  fetchMemberBorrowings()  // ✨ حدّث الاستعارات عند العودة للصفحة
})
</script>

<style scoped>
.page { padding: 32px; max-width: 1300px; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 600; color: #141414; margin: 0;
}
.page-sub { font-size: 13px; color: #888; margin-top: 2px; display: block; }

.toolbar {
  display: flex; gap: 10px; align-items: center;
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
.filter-select {
  padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; background: white; cursor: pointer; color: #333;
}
.filter-select:focus { outline: none; border-color: #c9a96e; }
.view-toggle { display: flex; gap: 4px; }
.toggle-btn {
  padding: 8px; border: 1px solid #e0e0e0; border-radius: 7px;
  background: white; cursor: pointer; color: #888; display: flex; transition: all 0.15s;
}
.toggle-btn.active { background: #141414; color: white; border-color: #141414; }

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

.table-wrap {
  background: white; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
}
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; font-size: 11px; color: #999; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
  padding: 10px 14px; border-bottom: 1px solid #f0f0f0; background: #fafafa;
}
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: #555; }
.sort-icon { font-size: 10px; margin-left: 4px; }
td { padding: 12px 14px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8; }
tr:last-child td { border-bottom: none; }
.table-row:hover { background: #fafaf8; }

.book-title-cell { display: flex; align-items: center; gap: 10px; }
.book-cover {
  width: 34px; height: 44px; border-radius: 6px;
  background: #f0ede8; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; color: #c9a96e;
}
.book-cover img { width: 100%; height: 100%; object-fit: cover; }
.book-name { display: block; font-weight: 500; color: #141414; }
.book-date { display: block; font-size: 11px; color: #aaa; }
.author-cell { color: #555; max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.isbn-cell { font-size: 12px; color: #888; font-family: monospace; }
.text-muted { color: #ccc; }

.copies-info { display: flex; align-items: center; gap: 2px; font-size: 13px; }
.available-copies { font-weight: 600; color: #16a34a; }
.copies-sep { color: #ccc; }
.total-copies { color: #888; }

.genre-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 20px;
  background: #f0ede8; color: #555; font-weight: 500;
}

.badge {
  display: inline-block; font-size: 11px; font-weight: 500;
  padding: 3px 9px; border-radius: 20px;
}
.badge.available   { background: #dcfce7; color: #16a34a; }
.badge.unavailable { background: #fee2e2; color: #dc2626; }

.actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.action-btn {
  padding: 6px; border: none; border-radius: 7px;
  cursor: pointer; display: flex; transition: all 0.15s;
}
.action-btn.edit { background: #f0f4ff; color: #4f46e5; }
.action-btn.edit:hover { background: #e0e7ff; }
.action-btn.delete { background: #fff0f0; color: #dc2626; }
.action-btn.delete:hover { background: #fee2e2; }

.btn-borrow {
  padding: 6px 10px;
  font-size: 11px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #6366f1;
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.btn-borrow:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
.btn-borrow:disabled,
.btn-borrow.is-disabled { background: #d1d5db; cursor: not-allowed; opacity: 0.6; }
.btn-borrow.in-progress:disabled {
  background: #16a34a;
  color: white;
  opacity: 1;
}

.btn-borrow-card {
  width: 100%;
  padding: 9px 12px;
  font-size: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #6366f1;
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 10px;
}
.btn-borrow-card:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
.btn-borrow-card:disabled,
.btn-borrow-card.is-disabled { background: #d1d5db; cursor: not-allowed; opacity: 0.6; }
.btn-borrow-card.in-progress:disabled {
  background: #16a34a;
  color: white;
  opacity: 1;
}

.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.book-card {
  background: white; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden; transition: box-shadow 0.15s;
  display: flex; flex-direction: column;
}
.book-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); }
.card-cover {
  height: 160px; background: #f0ede8;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; color: #c9a96e;
}
.card-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; align-items: center; justify-content: center; }
.card-actions-overlay {
  position: absolute; top: 8px; right: 8px;
  display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s;
}
.book-card:hover .card-actions-overlay { opacity: 1; }
.card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card-top { display: flex; gap: 6px; flex-wrap: wrap; }
.card-title { font-size: 14px; font-weight: 600; color: #141414; line-height: 1.3; }
.card-author { font-size: 12px; color: #888; }
.card-desc {
  font-size: 12px; color: #999; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.card-price { font-size: 13px; font-weight: 600; color: #c9a96e; }

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

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(2px);
}
.modal {
  background: white; border-radius: 16px; width: 100%;
  max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: slideUp 0.2s ease; max-height: 90vh; overflow-y: auto;
}
.modal-lg { max-width: 620px; }
.modal-sm { max-width: 380px; }
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 0; position: sticky; top: 0; background: white; z-index: 1;
}
.modal-header h2 { font-size: 17px; font-weight: 600; color: #141414; margin: 0; }
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

.borrow-book-info {
  background: #f8f7f5; padding: 12px 14px; border-radius: 8px;
  margin-bottom: 16px; border-left: 3px solid #c9a96e;
}
.borrow-book-info p { margin: 0; font-size: 13px; color: #333; }
.borrow-book-info .book-author { color: #888; margin-top: 4px; }

.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.field { display: flex; flex-direction: column; }
.field.span-2 { grid-column: span 2; }
.field label { font-size: 12px; font-weight: 500; color: #555; margin-bottom: 5px; }
.required { color: #dc2626; }
.field input, .field select, .field textarea {
  padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
  font-size: 13px; box-sizing: border-box; font-family: inherit;
  transition: border-color 0.15s; resize: vertical;
}
.field input:focus, .field select:focus, .field textarea:focus {
  outline: none; border-color: #c9a96e;
}
.field-error { font-size: 11px; color: #dc2626; margin-top: 4px; }
.form-error {
  background: #fee2e2; color: #dc2626; padding: 8px 12px;
  border-radius: 7px; font-size: 12px; margin-top: 8px;
}
.delete-msg { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 16px; }

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
.btn-danger {
  padding: 10px 18px; background: #dc2626; color: white;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 2000;
  animation: toastIn 0.25s ease;
}
.toast.success { background: #141414; color: white; }
.toast.error   { background: #dc2626; color: white; }

@keyframes toastIn {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
