/* ==========================================================================
   A. DATA KATALOG GAME (Whiteout Survival di Urutan Teratas)
   ========================================================================== */
const GAME_CATALOG = [
  {
    id: 'wos-frost-star',
    title: 'Whiteout Survival: Frost Star',
    publisher: 'Century Games PTE. LTD.',
    type: 'id',
    isPriority: true,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'WOS99', name: '99 Bintang Beku', price: 'Rp 19.000' },
      { code: 'WOS299', name: '299 Bintang Beku', price: 'Rp 55.000' },
      { code: 'WOS499', name: '499 Bintang Beku', price: 'Rp 90.000' },
      { code: 'WOS999', name: '999 Bintang Beku', price: 'Rp 185.000' },
      { code: 'WOS1999', name: '1999 Bintang Beku', price: 'Rp 370.000' },
      { code: 'WOS4999', name: '4999 Bintang Beku', price: 'Rp 915.000' },
      { code: 'WOS7499', name: '7499 Bintang Beku', price: 'Rp 1.375.000' },
      { code: 'WOS9999', name: '9999 Bintang Beku', price: 'Rp 1.830.000' }
    ]
  },
  {
    id: 'wos-via-login',
    title: 'Whiteout Survival (Via Login)',
    publisher: 'Century Games - Fast Gift Bundle',
    type: 'login',
    isPriority: true,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'WOS-PK-BULANAN', name: 'Paket Hemat Bulanan', price: 'Rp 68.000' },
      { code: 'WOS-WEEKLY', name: 'Weekly Card + Resources', price: 'Rp 42.000' },
      { code: 'WOS-PACK-9', name: 'Custom Pack $9.99', price: 'Rp 138.000' },
      { code: 'WOS-PACK-49', name: 'Mega Pack $49.99', price: 'Rp 690.000' },
      { code: 'WOS-PACK-99', name: 'Super Lord Pack $99.99', price: 'Rp 1.380.000' }
    ]
  },
  {
    id: 'mlbb',
    title: 'Mobile Legends: Bang Bang',
    publisher: 'Moonton Games',
    type: 'id',
    isPriority: false,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'ML86', name: '86 Diamonds', price: 'Rp 19.500' },
      { code: 'ML172', name: '172 Diamonds', price: 'Rp 38.500' },
      { code: 'ML257', name: '257 Diamonds', price: 'Rp 57.000' },
      { code: 'ML-WDP', name: 'Weekly Diamond Pass', price: 'Rp 27.500' }
    ]
  },
  {
    id: 'freefire',
    title: 'Free Fire Max',
    publisher: 'Garena International',
    type: 'id',
    isPriority: false,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'FF70', name: '70 Diamonds', price: 'Rp 9.500' },
      { code: 'FF140', name: '140 Diamonds', price: 'Rp 18.500' },
      { code: 'FF355', name: '355 Diamonds', price: 'Rp 46.000' }
    ]
  },
  {
    id: 'genshin',
    title: 'Genshin Impact',
    publisher: 'HoYoverse',
    type: 'id',
    isPriority: false,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'GI-WELKIN', name: 'Blessing Welkin Moon', price: 'Rp 68.000' },
      { code: 'GI300', name: '300 + 30 Genesis Crystals', price: 'Rp 65.000' }
    ]
  },
  {
    id: 'steam-idr',
    title: 'Steam Wallet Code (IDR)',
    publisher: 'Valve Corporation',
    type: 'voucher',
    isPriority: false,
    image: 'https://images.unsplash.com/photo-1612287233282-52a1d2f7823f?w=500&auto=format&fit=crop&q=80',
    items: [
      { code: 'STEAM45', name: 'Voucher Rp 45.000', price: 'Rp 48.000' },
      { code: 'STEAM60', name: 'Voucher Rp 60.000', price: 'Rp 64.000' }
    ]
  }
];

/* ==========================================================================
   B. RENDER DAFTAR GAME DENGAN SEARCH & FILTER
   ========================================================================== */
const gamesContainer = document.getElementById('gamesContainer');
let activeFilter = 'all';
let searchQuery = '';

function renderGameList() {
  gamesContainer.innerHTML = '';
  const filtered = GAME_CATALOG.filter(game => {
    const matchesType = (activeFilter === 'all') || (game.type === activeFilter);
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (filtered.length === 0) {
    gamesContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--cream-muted);">Game tidak ditemukan.</div>`;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = `game-card ${game.isPriority ? 'priority-card' : ''}`;
    
    let typeLabel = 'VIA ID';
    if (game.type === 'login') typeLabel = 'VIA LOGIN';
    if (game.type === 'voucher') typeLabel = 'VOUCHER';

    card.innerHTML = `
      <div class="game-img-wrapper">
        <img src="${game.image}" alt="${game.title}" loading="lazy" />
        <div class="game-type-badge">${typeLabel}</div>
      </div>
      <div class="game-meta">
        <div>
          <div class="game-title">${game.title}</div>
          <div class="game-publisher">${game.publisher}</div>
        </div>
        <button class="btn btn-red" style="padding: 5px 10px; font-size: 0.74rem; margin-top: 8px; width: 100%;">
          Top Up
        </button>
      </div>
    `;
    card.addEventListener('click', () => openOrderModal(game));
    gamesContainer.appendChild(card);
  });
}

document.querySelectorAll('.tab-pill').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeFilter = e.target.getAttribute('data-filter');
    renderGameList();
  });
});

document.querySelectorAll('.gameSearchInput').forEach(inp => {
  inp.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGameList();
  });
});

/* ==========================================================================
   C. MODAL TRANSAKSI & PENGIRIMAN KE BACKEND / SUPABASE
   ========================================================================== */
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
let currentSelectedGame = null;
let selectedItem = null;

function openOrderModal(game) {
  currentSelectedGame = game;
  document.getElementById('orderGameImg').src = game.image;
  document.getElementById('orderGameTitle').innerText = game.title;
  document.getElementById('orderGameCategory').innerText = game.type === 'login' ? 'Top Up via Login Akun' : 'Top Up via Player ID';

  const itemContainer = document.getElementById('itemOptionsContainer');
  itemContainer.innerHTML = '';
  selectedItem = game.items[0];

  game.items.forEach((it, idx) => {
    const itemBox = document.createElement('div');
    itemBox.className = `item-pill ${idx === 0 ? 'selected' : ''}`;
    itemBox.innerHTML = `
      <div class="item-name">${it.name}</div>
      <div class="item-price">${it.price}</div>
    `;
    itemBox.addEventListener('click', () => {
      document.querySelectorAll('.item-pill').forEach(p => p.classList.remove('selected'));
      itemBox.classList.add('selected');
      selectedItem = it;
    });
    itemContainer.appendChild(itemBox);
  });

  orderModal.classList.add('active');
}

closeOrderModal.onclick = () => orderModal.classList.remove('active');

// Tombol Submit Order: Simpan ke Server & Teruskan ke WA Admin
document.getElementById('btnSubmitOrder').addEventListener('click', async () => {
  const userId = document.getElementById('playerUserId').value.trim();
  const serverId = document.getElementById('playerServerId').value.trim();
  const buyerWa = document.getElementById('buyerWhatsapp').value.trim();
  const payment = document.getElementById('paymentMethod').value;

  if (!userId) {
    alert('Mohon isi User ID / Player ID akun game kamu!');
    return;
  }
  if (!buyerWa) {
    alert('Mohon isi No WhatsApp pembeli untuk verifikasi invoice!');
    return;
  }

  const payload = {
    userId: userId,
    serverId: serverId || '-',
    gameTitle: currentSelectedGame.title,
    item: selectedItem,
    paymentMethod: payment,
    buyerWhatsapp: buyerWa
  };

  let invoiceNumber = `TPM-${Date.now()}`;

  // Kirim data ke backend Node.js & Supabase
  try {
    const res = await fetch('/api/order/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.status && result.data.invoice) {
      invoiceNumber = result.data.invoice;
    }
  } catch (err) {
    console.warn('Backend offline / running standalone, using fallback invoice:', invoiceNumber);
  }

  // Format Pesan WhatsApp Admin 082121616716
  const adminPhone = '6282121616716';
  const textMessage = `Halo Admin topupmamang, saya sudah membuat order di website:\n\n` +
    `🧾 *Invoice*: ${invoiceNumber}\n` +
    `🎮 *Game*: ${currentSelectedGame.title}\n` +
    `💎 *Item*: ${selectedItem.name} (${selectedItem.price})\n` +
    `🆔 *User ID*: ${userId}\n` +
    `🌐 *Server/State*: ${serverId || '-'}\n` +
    `💳 *Metode Bayar*: ${payment}\n` +
    `📱 *No WA*: ${buyerWa}\n\n` +
    `Mohon segera diproses ya min. Terima kasih!`;

  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(textMessage)}`, '_blank');
  orderModal.classList.remove('active');
});

/* ==========================================================================
   D. AUTH MODAL (LOGIN & DAFTAR)
   ========================================================================== */
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const btnOpenLogin = document.getElementById('btnOpenLogin');
const btnOpenRegister = document.getElementById('btnOpenRegister');
const tabNavLogin = document.getElementById('tabNavLogin');
const tabNavRegister = document.getElementById('tabNavRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const navAuthArea = document.getElementById('navAuthArea');

function openAuth(mode = 'login') {
  authModal.classList.add('active');
  if (mode === 'login') {
    tabNavLogin.classList.add('active');
    tabNavRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  } else {
    tabNavRegister.classList.add('active');
    tabNavLogin.classList.remove('active');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
  }
}

btnOpenLogin.onclick = () => openAuth('login');
btnOpenRegister.onclick = () => openAuth('register');
tabNavLogin.onclick = () => openAuth('login');
tabNavRegister.onclick = () => openAuth('register');
closeAuthModal.onclick = () => authModal.classList.remove('active');

function setLoggedInUser(username) {
  if (username) {
    navAuthArea.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.8rem; font-weight:700; color:var(--cream-light); max-width:85px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <i class="fa-solid fa-user" style="color:var(--red-primary);"></i> ${username}
        </span>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" id="btnLogout">Keluar</button>
      </div>
    `;
    document.getElementById('btnLogout').onclick = () => {
      localStorage.removeItem('topupmamang_user');
      location.reload();
    };
  }
}

formLogin.onsubmit = (e) => {
  e.preventDefault();
  const user = document.getElementById('inputLoginUser').value;
  localStorage.setItem('topupmamang_user', user);
  setLoggedInUser(user);
  authModal.classList.remove('active');
  alert(`Selamat datang kembali di topupmamang, ${user}!`);
};

formRegister.onsubmit = (e) => {
  e.preventDefault();
  const user = document.getElementById('inputRegName').value;
  localStorage.setItem('topupmamang_user', user);
  setLoggedInUser(user);
  authModal.classList.remove('active');
  alert(`Akun berhasil dibuat! Selamat datang di topupmamang, ${user}!`);
};

/* ==========================================================================
   E. ANTIGRAVITY LIVING PARTICLE ENGINE (CANVAS)
   ========================================================================== */
const canvas = document.getElementById('antigravity-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class AntigravityParticle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
    this.radius = Math.random() * 2 + 0.5;
    this.speedY = -(Math.random() * 0.6 + 0.2);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.4 + 0.15;
    this.isRed = Math.random() > 0.6;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y < -10) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isRed ? `rgba(230, 57, 70, ${this.alpha})` : `rgba(253, 251, 247, ${this.alpha * 0.7})`;
    ctx.fill();
  }
}

for (let i = 0; i < 40; i++) particles.push(new AntigravityParticle());

function animateAntigravity() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateAntigravity);
}

window.onload = () => {
  renderGameList();
  animateAntigravity();
  const savedUser = localStorage.getItem('topupmamang_user');
  if (savedUser) setLoggedInUser(savedUser);
};
