<template>
  <div class="home">

    <!-- ══════════════════════════════════════
         HERO
    ══════════════════════════════════════ -->
    <section class="hero">
      <div class="hero-bg">
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-lines">
          <span v-for="i in 8" :key="i"></span>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="dot"></span>
          Welcome to the Library
        </div>
        <h1 class="hero-title">
          Discover Your<br />
          <em>Next Chapter</em>
        </h1>
        <p class="hero-sub">
          Thousands of books, seamless borrowing, and a reading community — all in one place.
        </p>
        <div class="hero-actions">
          <router-link to="/books" class="btn-hero-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Browse Books
          </router-link>
          <router-link to="/borrowings" class="btn-hero-ghost">
            My Borrowings →
          </router-link>
        </div>
      </div>

      <div class="hero-visual">
        <div class="book-stack">
          <div class="book b1">
            <span>Fiction</span>
          </div>
          <div class="book b2">
            <span>Science</span>
          </div>
          <div class="book b3">
            <span>History</span>
          </div>
          <div class="book b4">
            <span>Art</span>
          </div>
          <div class="book-shadow"></div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         STATS
    ══════════════════════════════════════ -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon" :style="{ background: stat.color + '18', color: stat.color }">
            <component :is="'span'" v-html="stat.icon"></component>
          </div>
          <div class="stat-body">
            <div class="stat-value" :data-value="stat.value">
              <span class="stat-num">{{ stat.display }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         FEATURES
    ══════════════════════════════════════ -->
    <section class="features-section">
      <div class="section-header">
        <span class="section-tag">What We Offer</span>
        <h2 class="section-title">Everything You Need</h2>
      </div>

      <div class="features-grid">
        <div class="feature-card fc-large">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <h3>Vast Collection</h3>
          <p>Explore thousands of titles across every genre — from timeless classics to the latest releases.</p>
          <div class="feature-decoration">
            <div class="mini-book" v-for="i in 5" :key="i" :style="{ '--delay': i * 0.1 + 's', '--h': (40 + i * 12) + 'px' }"></div>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          </div>
          <h3>Easy Renewals</h3>
          <p>Extend your borrowing period in one click — no queues, no hassle.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>Due Date Alerts</h3>
          <p>Get notified before your due date so you never miss a return.</p>
        </div>

        <div class="feature-card fc-accent">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>Member Community</h3>
          <p>Join a growing community of readers and discover recommendations.</p>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         RECENT BOOKS
    ══════════════════════════════════════ -->
    <section class="books-section">
      <div class="section-header">
        <span class="section-tag">Just Added</span>
        <h2 class="section-title">Recent Arrivals</h2>
        <router-link to="/books" class="section-link">View all books →</router-link>
      </div>

      <div v-if="loadingBooks" class="books-loading">
        <div class="spinner"></div>
        <span>Loading books...</span>
      </div>

      <div v-else class="books-grid">
        <div class="book-card" v-for="book in recentBooks" :key="book.id">
          <div class="book-card-cover" :style="{ background: bookColor(book.title) }">
            <div class="book-card-spine"></div>
            <span class="book-card-initial">{{ book.title?.charAt(0) }}</span>
          </div>
          <div class="book-card-info">
            <span class="book-card-title">{{ book.title }}</span>
            <span class="book-card-author">{{ book.author?.name || 'Unknown Author' }}</span>
            <div class="book-card-footer">
              <span class="book-card-copies" :class="{ unavailable: !book.is_available }">
                {{ book.is_available ? book.available_copies + ' available' : 'Unavailable' }}
              </span>
              <span class="book-card-isbn">{{ book.isbn }}</span>
            </div>
          </div>
        </div>

        <div v-if="recentBooks.length === 0" class="books-empty">
          No books found.
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         CTA
    ══════════════════════════════════════ -->
    <section class="cta-section">
      <div class="cta-inner">
        <div class="cta-text">
          <h2>Ready to Start Reading?</h2>
          <p>Browse our full catalog and borrow your next favorite book today.</p>
        </div>
        <div class="cta-actions">
          <router-link to="/books" class="btn-cta">
            Explore the Catalog
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </router-link>
        </div>
      </div>
      <div class="cta-deco">
        <div class="deco-ring r1"></div>
        <div class="deco-ring r2"></div>
        <div class="deco-ring r3"></div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const recentBooks  = ref([])
const loadingBooks = ref(false)

const stats = ref([
  {
    label:   'Books Available',
    display: '—',
    value:   0,
    color:   '#c9a96e',
    icon:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  },
  {
    label:   'Active Members',
    display: '—',
    value:   0,
    color:   '#6e9cc9',
    icon:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    label:   'Books Borrowed',
    display: '—',
    value:   0,
    color:   '#9cc96e',
    icon:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`,
  },
  {
    label:   'Authors',
    display: '—',
    value:   0,
    color:   '#c96e9c',
    icon:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  },
])

const fetchStats = async () => {
  try {
    const [booksRes, membersRes, borrowingsRes, authorsRes] = await Promise.allSettled([
      api.get('/books'),
      api.get('/members'),
      api.get('/borrowings'),
      api.get('/authors'),
    ])

    if (booksRes.status === 'fulfilled') {
      const books = booksRes.value.data.data || booksRes.value.data
      const available = Array.isArray(books) ? books.filter(b => b.is_available).length : (booksRes.value.data.meta?.total || books.length)
      stats.value[0].display = formatNumber(booksRes.value.data.meta?.total || books.length)
    }
    if (membersRes.status === 'fulfilled') {
      const members = membersRes.value.data.data || membersRes.value.data
      stats.value[1].display = formatNumber(membersRes.value.data.meta?.total || members.length)
    }
    if (borrowingsRes.status === 'fulfilled') {
      const borrowings = borrowingsRes.value.data.data || borrowingsRes.value.data
      stats.value[2].display = formatNumber(borrowingsRes.value.data.meta?.total || borrowings.length)
    }
    if (authorsRes.status === 'fulfilled') {
      const authors = authorsRes.value.data.data || authorsRes.value.data
      stats.value[3].display = formatNumber(authorsRes.value.data.meta?.total || authors.length)
    }
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  }
}

const fetchRecentBooks = async () => {
  loadingBooks.value = true
  try {
    const res = await api.get('/books?per_page=6')
    const books = res.data.data || res.data
    recentBooks.value = Array.isArray(books) ? books.slice(0, 6) : []
  } catch (e) {
    console.error('Failed to fetch recent books:', e)
  } finally {
    loadingBooks.value = false
  }
}

const formatNumber = (n) => {
  if (!n || isNaN(n)) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

const bookColor = (title) => {
  const palettes = [
    'linear-gradient(135deg, #c9a96e, #8b6914)',
    'linear-gradient(135deg, #6e9cc9, #2563a8)',
    'linear-gradient(135deg, #9cc96e, #4a8a1a)',
    'linear-gradient(135deg, #c96e9c, #a0245e)',
    'linear-gradient(135deg, #6ec9c9, #1a7a8a)',
    'linear-gradient(135deg, #9c6ec9, #5a24a0)',
    'linear-gradient(135deg, #c9796e, #a03424)',
  ]
  let hash = 0
  for (let i = 0; i < (title || '').length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

onMounted(() => {
  fetchStats()
  fetchRecentBooks()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; }

.home {
  font-family: 'DM Sans', sans-serif;
  background: #f5f3ef;
  min-height: 100vh;
}

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  padding: 80px 64px;
  overflow: hidden;
  gap: 48px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}
.c1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #c9a96e55, transparent);
  top: -200px; right: -100px;
  animation: float1 8s ease-in-out infinite;
}
.c2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #6e9cc933, transparent);
  bottom: -100px; left: 200px;
  animation: float2 10s ease-in-out infinite;
}
@keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px, 20px); } }
@keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px, -30px); } }

.bg-lines {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: stretch;
  gap: 0;
  opacity: 0.04;
}
.bg-lines span {
  flex: 1;
  border-right: 1px solid #141414;
}

.hero-content {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 560px;
  animation: fadeUp 0.8s ease both;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #c9a96e;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 20px;
}
.dot {
  width: 6px; height: 6px;
  background: #c9a96e;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 700;
  line-height: 1.05;
  color: #141414;
  margin: 0 0 24px;
  letter-spacing: -0.02em;
}
.hero-title em {
  font-style: italic;
  color: #c9a96e;
}

.hero-sub {
  font-size: 17px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 40px;
  max-width: 420px;
  font-weight: 300;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #141414;
  color: white;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(20,20,20,0.2);
}
.btn-hero-primary:hover {
  background: #c9a96e;
  box-shadow: 0 8px 32px rgba(201,169,110,0.35);
  transform: translateY(-2px);
}

.btn-hero-ghost {
  color: #555;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  border-bottom: 1px solid #ddd;
  padding-bottom: 2px;
}
.btn-hero-ghost:hover { color: #141414; border-color: #141414; }

/* Book stack visual */
.hero-visual {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 260px;
  height: 320px;
  animation: fadeUp 0.8s 0.2s ease both;
}

.book-stack {
  position: relative;
  width: 100%;
  height: 100%;
}

.book {
  position: absolute;
  border-radius: 4px 12px 12px 4px;
  display: flex;
  align-items: flex-end;
  padding: 16px 14px;
  font-family: 'Playfair Display', serif;
  font-size: 11px;
  font-style: italic;
  color: rgba(255,255,255,0.8);
  box-shadow: 4px 4px 24px rgba(0,0,0,0.18);
  transition: transform 0.3s ease;
}
.book::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 18px;
  background: rgba(0,0,0,0.15);
  border-radius: 4px 0 0 4px;
}
.book:hover { transform: translateY(-8px) rotate(0deg) !important; }

.b1 {
  width: 80px; height: 260px;
  background: linear-gradient(180deg, #c9a96e, #8b6914);
  left: 20px; bottom: 20px;
  transform: rotate(-3deg);
  animation: bookFloat1 6s ease-in-out infinite;
}
.b2 {
  width: 75px; height: 220px;
  background: linear-gradient(180deg, #6e9cc9, #2563a8);
  left: 90px; bottom: 20px;
  transform: rotate(1deg);
  animation: bookFloat2 7s ease-in-out infinite;
}
.b3 {
  width: 70px; height: 240px;
  background: linear-gradient(180deg, #9c6ec9, #5a24a0);
  left: 155px; bottom: 20px;
  transform: rotate(-1.5deg);
  animation: bookFloat1 5s ease-in-out infinite reverse;
}
.b4 {
  width: 60px; height: 180px;
  background: linear-gradient(180deg, #c96e9c, #a0245e);
  left: 48px; bottom: 20px;
  transform: rotate(2deg);
  animation: bookFloat2 8s ease-in-out infinite;
}
.book-shadow {
  position: absolute;
  bottom: 10px; left: 10px; right: 10px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.2), transparent);
  filter: blur(8px);
}

@keyframes bookFloat1 { 0%,100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-12px); } }
@keyframes bookFloat2 { 0%,100% { transform: rotate(1deg) translateY(0); } 50% { transform: rotate(1deg) translateY(-8px); } }

/* ── STATS ── */
.stats-section {
  padding: 0 64px 64px;
  animation: fadeUp 0.8s 0.3s ease both;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #141414;
  display: block;
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  font-weight: 400;
}

/* ── FEATURES ── */
.features-section {
  padding: 0 64px 80px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.section-tag {
  font-size: 11px;
  font-weight: 500;
  color: #c9a96e;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: #c9a96e18;
  padding: 4px 12px;
  border-radius: 20px;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: #141414;
  margin: 0;
  flex: 1;
}
.section-link {
  font-size: 13px;
  color: #c9a96e;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
  white-space: nowrap;
}
.section-link:hover { color: #8b6914; }

.features-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}

.fc-large {
  grid-row: span 2;
}
.fc-accent {
  background: #141414;
  color: white;
}
.fc-accent h3 { color: white; }
.fc-accent p  { color: rgba(255,255,255,0.6); }
.fc-accent .feature-icon {
  background: rgba(255,255,255,0.1);
  color: #c9a96e;
}

.feature-icon {
  width: 48px; height: 48px;
  background: #f5f0e8;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #c9a96e;
  margin-bottom: 20px;
}
.feature-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 600;
  color: #141414;
  margin: 0 0 10px;
}
.feature-card p {
  font-size: 14px;
  color: #888;
  line-height: 1.7;
  margin: 0;
  font-weight: 300;
}

.feature-decoration {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}
.mini-book {
  width: 14px;
  height: var(--h, 40px);
  border-radius: 2px 4px 4px 2px;
  background: linear-gradient(180deg, #c9a96e44, #c9a96e22);
  border: 1px solid #c9a96e33;
  animation: miniFloat 3s var(--delay, 0s) ease-in-out infinite;
}
@keyframes miniFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* ── BOOKS GRID ── */
.books-section {
  padding: 0 64px 80px;
}

.books-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #aaa;
  font-size: 14px;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #eee;
  border-top-color: #c9a96e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.books-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.12);
}

.book-card-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.book-card-spine {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 10px;
  background: rgba(0,0,0,0.15);
}
.book-card-initial {
  font-family: 'Playfair Display', serif;
  font-size: 52px;
  font-style: italic;
  color: rgba(255,255,255,0.35);
  font-weight: 700;
  user-select: none;
  line-height: 1;
}

.book-card-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.book-card-title {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.book-card-author {
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.book-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.book-card-copies {
  font-size: 10px;
  font-weight: 500;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 7px;
  border-radius: 20px;
}
.book-card-copies.unavailable {
  color: #dc2626;
  background: #fee2e2;
}
.book-card-isbn {
  font-size: 10px;
  color: #ccc;
  font-family: monospace;
}
.books-empty {
  grid-column: 1/-1;
  text-align: center;
  color: #bbb;
  padding: 48px;
  font-size: 14px;
}

/* ── CTA ── */
.cta-section {
  margin: 0 64px 80px;
  background: #141414;
  border-radius: 24px;
  padding: 64px;
  position: relative;
  overflow: hidden;
}
.cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}
.cta-text h2 {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px;
}
.cta-text p {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  margin: 0;
  font-weight: 300;
}
.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #c9a96e;
  color: white;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(201,169,110,0.3);
}
.btn-cta:hover {
  background: #e8c882;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(201,169,110,0.5);
}

.cta-deco {
  position: absolute;
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(201,169,110,0.15);
  transform: translate(-50%, -50%);
}
.r1 { width: 200px; height: 200px; }
.r2 { width: 340px; height: 340px; }
.r3 { width: 500px; height: 500px; }

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .books-grid { grid-template-columns: repeat(3, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .fc-large { grid-row: span 1; }
}

@media (max-width: 768px) {
  .hero { padding: 64px 24px; flex-direction: column; min-height: auto; }
  .hero-visual { display: none; }
  .stats-section, .features-section, .books-section { padding-left: 24px; padding-right: 24px; }
  .cta-section { margin: 0 24px 64px; padding: 40px 32px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .books-grid { grid-template-columns: repeat(2, 1fr); }
  .section-header { flex-direction: column; gap: 8px; }
}
</style>