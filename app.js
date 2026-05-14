/* ============================================================
   LABU KARYA PUBLISHER — app.js
   Katalog hanya menampilkan buku yang sudah diverifikasi admin
   (labuKaryaApproved). Submission baru masuk ke labuKaryaPending
   dan hanya tampil setelah admin menyetujuinya via admin.html
   ============================================================ */

/* ──────────────────────────────────────────────
   1. DATA BUKU AWAL (seed / contoh)
   ────────────────────────────────────────────── */
const SEED_BOOKS = [
  {
    judul: "Satu Musim di Ujung Desa",
    penulis: "Rania Kusuma",
    genre: "Cerpen Inspiratif",
    harga: "75000",
    sinopsis: "Kisah seorang guru muda yang menemukan makna hidup sesungguhnya di pelosok Kalimantan. Penuh hangat dan kejutan.",
    shopee: "https://shopee.co.id",
    tokped: "https://tokopedia.com",
    coverColor: "#1a4fa0",
    coverEmoji: "📖",
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isSeed: true,
  },
  {
    judul: "Perempuan dari Timur",
    penulis: "Dhea Larasati",
    genre: "Romance",
    harga: "89000",
    sinopsis: "Dua jiwa yang bertemu di persimpangan takdir. Novel romantis yang menggetarkan hati, berlatar budaya Nusantara.",
    shopee: "https://shopee.co.id",
    tokped: "",
    coverColor: "#8b1a5a",
    coverEmoji: "💕",
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isSeed: true,
  },
  {
    judul: "Rumus Bahagia",
    penulis: "Arif Wibowo",
    genre: "Self-Help",
    harga: "65000",
    sinopsis: "Panduan praktis membangun kebiasaan positif berdasarkan riset psikologi dan pengalaman nyata penulis.",
    shopee: "",
    tokped: "https://tokopedia.com",
    coverColor: "#0f6b38",
    coverEmoji: "💪",
    submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isSeed: true,
  },
];

/* ──────────────────────────────────────────────
   2. STORAGE KEYS
   ────────────────────────────────────────────── */
const APPROVED_KEY = 'labuKaryaApproved'; // buku yg sudah diverifikasi admin
const PENDING_KEY  = 'labuKaryaPending';   // submission menunggu tinjauan

/* ──────────────────────────────────────────────
   3. STORAGE HELPERS
   ────────────────────────────────────────────── */
function getAllBooks() {
  let approved = [];
  try {
    approved = JSON.parse(localStorage.getItem(APPROVED_KEY) || '[]');
  } catch (e) { approved = []; }
  return [...SEED_BOOKS, ...approved];
}

function getApprovedBooks() {
  try {
    return JSON.parse(localStorage.getItem(APPROVED_KEY) || '[]');
  } catch (e) { return []; }
}

/* ──────────────────────────────────────────────
   4. FORMAT HELPERS
   ────────────────────────────────────────────── */
function formatRupiah(angka) {
  const num = parseInt(String(angka).replace(/\D/g, '')) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

/* ──────────────────────────────────────────────
   5. RENDER KARTU BUKU
   ────────────────────────────────────────────── */
function renderBookCard(book, index) {
  let coverHTML = '';
  if (book.coverDataUrl) {
    coverHTML = `<img src="${book.coverDataUrl}" alt="Cover ${book.judul}" class="book-cover-img"/>`;
  } else {
    const colors = {
      'Cerpen Inspiratif': '#1a4fa0', 'Romance': '#8b1a5a',
      'Fiksi Ilmiah': '#0a3d6b', 'Fantasi': '#3d1a8b',
      'Thriller & Misteri': '#1a1a2e', 'Pendidikan': '#0f5a32',
      'Biografi': '#4a2000', 'Self-Help': '#0f6b38',
      'Puisi & Sastra': '#6b1a3d', 'Agama & Spiritual': '#3d2a00',
      'Komedi': '#c45e00', 'Lainnya': '#2d4a6b',
    };
    const emojis = {
      'Cerpen Inspiratif': '📖', 'Romance': '💕', 'Fiksi Ilmiah': '🚀',
      'Fantasi': '🧙', 'Thriller & Misteri': '🔍', 'Pendidikan': '🎓',
      'Biografi': '👤', 'Self-Help': '💪', 'Puisi & Sastra': '🌸',
      'Agama & Spiritual': '🕌', 'Komedi': '😄', 'Lainnya': '📦',
    };
    const bg = book.coverColor || colors[book.genre] || '#1a4fa0';
    const emoji = book.coverEmoji || emojis[book.genre] || '📚';
    coverHTML = `
      <div class="book-cover-fallback" style="background: linear-gradient(145deg, ${bg}dd, ${bg}88);">
        <span class="book-cover-emoji">${emoji}</span>
      </div>`;
  }

  const shopeeBtn = book.shopee
    ? `<a class="buy-btn shopee-btn" href="${book.shopee}" target="_blank" rel="noopener">🛍️ Shopee</a>` : '';
  const tokpedBtn = book.tokped
    ? `<a class="buy-btn tokped-btn" href="${book.tokped}" target="_blank" rel="noopener">🏪 Tokopedia</a>` : '';
  const noBuy = (!book.shopee && !book.tokped)
    ? `<span class="buy-soon">Segera hadir di marketplace</span>` : '';

  const isNew = (Date.now() - new Date(book.submittedAt || book.approvedAt).getTime()) < 86400000 * 3;
  const hasEbook = book.hasEbook;

  return `
    <div class="book-card" data-genre="${book.genre}" data-index="${index}">
      <div class="book-cover">
        ${isNew ? '<span class="badge-new">Baru</span>' : ''}
        ${hasEbook ? '<span class="badge-ebook">E-Book</span>' : ''}
        ${coverHTML}
      </div>
      <div class="book-info">
        <span class="book-genre">${book.genre}</span>
        <h3 class="book-title">${book.judul}</h3>
        <p class="book-author">✍️ ${book.pena || book.penulis}</p>
        <p class="book-synopsis">${book.sinopsis}</p>
        <div class="book-footer">
          <span class="book-price">${formatRupiah(book.harga)}</span>
          <div class="book-actions">${shopeeBtn}${tokpedBtn}${noBuy}</div>
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────
   6. KATALOG — RENDER, FILTER, SEARCH
   ────────────────────────────────────────────── */
let activeGenre = 'all';
let searchQuery = '';

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('catalogEmpty');
  const statBuku = document.getElementById('statBuku');
  if (!grid) return;

  const books = getAllBooks();
  if (statBuku) animateCount(statBuku, books.length);

  let filtered = books.filter(b => {
    const matchGenre = activeGenre === 'all' || b.genre === activeGenre;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      b.judul.toLowerCase().includes(q) ||
      b.penulis.toLowerCase().includes(q) ||
      (b.pena && b.pena.toLowerCase().includes(q)) ||
      b.genre.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = filtered.map((b, i) => renderBookCard(b, i)).join('');
    grid.querySelectorAll('.book-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 60);
    });
  }
}

function animateCount(el, target) {
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const duration = 600;
  const step = (target - start) / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      el.textContent = target; clearInterval(timer);
    } else {
      el.textContent = Math.round(current);
    }
  }, 16);
}

/* ──────────────────────────────────────────────
   7. NAVBAR, SCROLL, HAMBURGER
   ────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ──────────────────────────────────────────────
   8. UPLOAD BUTTON → redirect ke upload.html
   ────────────────────────────────────────────── */
function redirectToUpload() {
  window.location.href = 'upload.html';
}

function initUploadButtons() {
  document.querySelectorAll('.upload-trigger, .btn-secondary').forEach(el => {
    el.addEventListener('click', redirectToUpload);
  });

  const overlay = document.getElementById('uploadModal');
  if (overlay) overlay.style.display = 'none';
}

/* ──────────────────────────────────────────────
   9. FILTER BAR & SEARCH
   ────────────────────────────────────────────── */
function initFilters() {
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    renderCatalog();
  });

  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGenre = btn.dataset.genre;
      renderCatalog();
    });
  });
}

/* ──────────────────────────────────────────────
   10. TOAST NOTIFICATION
   ────────────────────────────────────────────── */
function showToast(msg, success = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.style.background = success ? '#1a8a4a' : '#c00';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ──────────────────────────────────────────────
   11. INJECT CSS TAMBAHAN
   ────────────────────────────────────────────── */
function injectCardStyles() {
  if (document.getElementById('lk-card-styles')) return;
  const style = document.createElement('style');
  style.id = 'lk-card-styles';
  style.textContent = `
    .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
    .book-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(13,33,71,0.10); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s, box-shadow 0.25s; }
    .book-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(13,33,71,0.18); }
    .book-cover { position: relative; aspect-ratio: 3/4; overflow: hidden; background: #ddeeff; }
    .book-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .book-cover-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .book-cover-emoji { font-size: 3.5rem; }
    .badge-new { position: absolute; top: 10px; left: 10px; z-index: 2; background: #2d7cf5; color: #fff; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; padding: 0.2rem 0.6rem; border-radius: 50px; text-transform: uppercase; }
    .badge-ebook { position: absolute; top: 10px; right: 10px; z-index: 2; background: #7c4dff; color: #fff; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.5px; padding: 0.2rem 0.55rem; border-radius: 50px; text-transform: uppercase; }
    .book-info { padding: 1.1rem 1.2rem 1.3rem; display: flex; flex-direction: column; gap: 0.45rem; flex: 1; }
    .book-genre { font-size: 0.72rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #2d7cf5; }
    .book-title { font-family: 'Playfair Display', Georgia, serif; font-size: 1rem; font-weight: 700; color: #0d1b2e; line-height: 1.3; }
    .book-author { font-size: 0.8rem; color: #6b7a8d; }
    .book-synopsis { font-size: 0.82rem; color: #334155; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .book-footer { margin-top: auto; padding-top: 0.7rem; border-top: 1px solid #f4f6fb; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
    .book-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; color: #2d7cf5; letter-spacing: 0.5px; }
    .book-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .buy-btn { font-size: 0.75rem; font-weight: 800; padding: 0.3rem 0.7rem; border-radius: 50px; transition: all 0.2s; white-space: nowrap; text-decoration: none; }
    .shopee-btn { background: #fff0e6; color: #ee5c00; border: 1px solid #ffd0a0; }
    .shopee-btn:hover { background: #ffe0c0; }
    .tokped-btn { background: #e8f5e8; color: #00880a; border: 1px solid #a0d8a0; }
    .tokped-btn:hover { background: #c8ecc8; }
    .buy-soon { font-size: 0.72rem; color: #c5cdd8; font-style: italic; }
    .catalog-empty { text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.7rem; }
    .empty-icon { font-size: 3.5rem; }
    .catalog-empty h3 { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #0d1b2e; }
    .catalog-empty p { color: #6b7a8d; font-size: 0.9rem; }
    .hero-stats { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; animation: fadeUp 0.7s 0.4s ease both; }
    .stat { display: flex; flex-direction: column; }
    .stat span { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #fff; line-height: 1; }
    .stat small { font-size: 0.75rem; color: rgba(255,255,255,0.55); }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }
    .search-input { background: #fff; border: 1.5px solid #c5cdd8; border-radius: 50px; padding: 0.65rem 1.2rem; font-size: 0.92rem; color: #0d1b2e; outline: none; transition: border-color 0.2s, box-shadow 0.2s; min-width: 220px; }
    .search-input:focus { border-color: #2d7cf5; box-shadow: 0 0 0 3px rgba(45,124,245,0.12); }
    .filter-bar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .genre-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .genre-btn { background: #f4f6fb; border: 1.5px solid #c5cdd8; color: #6b7a8d; font-weight: 700; font-size: 0.83rem; padding: 0.4rem 1rem; border-radius: 50px; transition: all 0.2s; cursor: pointer; }
    .genre-btn:hover { border-color: #2d7cf5; color: #2d7cf5; }
    .genre-btn.active { background: #2d7cf5; border-color: #2d7cf5; color: #fff; box-shadow: 0 4px 12px rgba(45,124,245,0.3); }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────
   12. INIT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectCardStyles();
  initNavbar();
  initUploadButtons();
  initFilters();
  renderCatalog();
});

/* ──────────────────────────────────────────────
   13. LISTEN perubahan localStorage dari tab lain
   ────────────────────────────────────────────── */
window.addEventListener('storage', (e) => {
  if (e.key === APPROVED_KEY) {
    renderCatalog();
  }
});
