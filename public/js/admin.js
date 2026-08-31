// Variabel Global Admin Scope
let allOrders = [];
let allUsers = [];
let allArticles = [];
let allProducts = [];
let allBanners = [];
let allGameCategories = [];
let allFlashSales = [];
let selectedTargetUser = null;
let selectedSku = null;
let activeGameFilter = "ALL";

// ==========================================
// 1. GLOBAL ACTION HANDLERS & MODAL BINDINGS
// ==========================================

// --- WHATSAPP & ORDERS ---
window.openWhatsAppReceipt = function(orderId) {
  const o = allOrders.find((item) => String(item.id) === String(orderId));
  if (!o) return alert("Data pesanan tidak ditemukan!");
  if (!o.whatsapp) return alert("Pesanan ini tidak memiliki nomor WhatsApp pembeli!");

  let phone = String(o.whatsapp).replace(/[^0-9]/g, "");
  if (phone.startsWith("0")) phone = "62" + phone.substring(1);
  else if (phone.startsWith("8")) phone = "62" + phone;

  const targetAcc = o.zone_id ? `${o.account_id} (${o.zone_id})` : o.account_id;
  const priceFormatted = Number(o.price || 0).toLocaleString("id-ID");

  const message = 
`Halo Kak! Terima kasih sudah order di *MamangGS* 🎮🔥

Berikut adalah rincian pesanan Anda:
📄 *No. Invoice:* ${o.invoice}
🎮 *Game:* ${o.game_title || o.game_code}
💎 *Item:* ${o.item_name}
🆔 *Data Akun:* ${targetAcc}
💰 *Total Bayar:* Rp ${priceFormatted}
📌 *Status Pesanan:* *${o.status}*

Cek detail atau download invoice di:
🔗 https://mamanggs.vercel.app/order-status.html?inv=${o.invoice}

Pesanan Anda telah kami proses. Terima kasih dan selamat bermain! ✨`;

  const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
};

window.updateOrderStatus = async function(orderId, newStatus) {
  if (!confirm(`Ubah status pesanan ini menjadi ${newStatus}?`)) return;
  const { error } = await window.supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  if (error) {
    alert("Gagal update status: " + error.message);
  } else {
    alert(`Status pesanan berhasil diubah ke ${newStatus}!`);
    window.loadDashboardData();
  }
};

// --- BALANCE MEMBER ---
window.openBalanceModal = function(userId, name) {
  selectedTargetUser = userId;
  const nameEl = document.getElementById("modalUserName");
  const inputEl = document.getElementById("modalAmountInput");
  const modalEl = document.getElementById("balanceModal");

  if (nameEl) nameEl.innerText = name;
  if (inputEl) inputEl.value = "";
  if (modalEl) modalEl.classList.add("show");
};

// --- ARTIKEL BLOG ---
window.togglePublishArticle = async function(articleId, newStatus) {
  try {
    const { error } = await window.supabase.from("articles").update({ is_published: newStatus, updated_at: new Date().toISOString() }).eq("id", articleId);
    if (error) throw error;
    window.fetchAdminArticles();
  } catch (err) {
    alert("Gagal mengubah status artikel: " + err.message);
  }
};

window.deleteArticle = async function(articleId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  if (!confirm(`Yakin ingin MENGHAPUS artikel ini secara permanen?\n\n"${title}"`)) return;
  try {
    const { error } = await window.supabase.from("articles").delete().eq("id", articleId);
    if (error) throw error;
    alert("Artikel berhasil dihapus.");
    window.fetchAdminArticles();
  } catch (err) {
    alert("Gagal menghapus artikel: " + err.message);
  }
};

// --- PRODUK & FILTER ---
window.openPriceModal = function(sku, encodedName, basePrice, sellPrice) {
  selectedSku = sku;
  const modalEl = document.getElementById("priceModal");
  const productName = decodeURIComponent(encodedName);
  
  if (document.getElementById("modalProductName")) document.getElementById("modalProductName").innerText = productName;
  if (document.getElementById("modalBasePrice")) {
    const cleanBase = Number(basePrice) || 0;
    document.getElementById("modalBasePrice").value = "Rp " + cleanBase.toLocaleString("id-ID");
  }
  if (document.getElementById("modalSellPriceInput")) {
    document.getElementById("modalSellPriceInput").value = Number(sellPrice) || 0;
  }
  if (modalEl) modalEl.classList.add("show");
};

window.setGameFilter = function(gameName) {
  activeGameFilter = gameName;
  const filterSelect = document.getElementById("filterProductGame");
  if (filterSelect) filterSelect.value = gameName;
  populateGameFilters(allProducts);
  renderProductsTable(allProducts);
};

// --- BANNER MODAL & ACTIONS ---
window.openBannerModal = function() {
  document.getElementById("bannerTitleInput").value = "";
  document.getElementById("bannerUrlInput").value = "";
  document.getElementById("bannerLinkInput").value = "";
  document.getElementById("bannerModal")?.classList.add("show");
};

window.closeBannerModal = function() {
  document.getElementById("bannerModal")?.classList.remove("show");
};

window.submitBanner = async function() {
  const title = document.getElementById("bannerTitleInput")?.value.trim();
  const image_url = document.getElementById("bannerUrlInput")?.value.trim();
  const target_url = document.getElementById("bannerLinkInput")?.value.trim() || "#";

  if (!title || !image_url) return alert("Judul dan URL gambar banner wajib diisi!");

  const btn = document.getElementById("btnSubmitBanner");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const { error } = await window.supabase.from("banners").insert([{ title, image_url, target_url, is_active: true }]);
    if (error) throw error;
    alert("Banner berhasil ditambahkan!");
    window.closeBannerModal();
    window.fetchAdminBanners();
  } catch (err) {
    alert("Gagal menambahkan banner: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan Banner';
  }
};

window.toggleBannerStatus = async function(id, status) {
  const { error } = await window.supabase.from("banners").update({ is_active: status }).eq("id", id);
  if (error) alert("Gagal update status banner: " + error.message);
  else window.fetchAdminBanners();
};

window.deleteBanner = async function(id) {
  if (!confirm("Hapus banner ini?")) return;
  const { error } = await window.supabase.from("banners").delete().eq("id", id);
  if (error) alert("Gagal menghapus banner: " + error.message);
  else window.fetchAdminBanners();
};

// --- GAME CATEGORY MODAL & ACTIONS ---
window.openGameModal = function() {
  document.getElementById("gameCodeInput").value = "";
  document.getElementById("gameTitleInput").value = "";
  document.getElementById("gameDevInput").value = "";
  document.getElementById("gameImgInput").value = "";
  document.getElementById("gameIsPopular").checked = false;
  document.getElementById("gameModal")?.classList.add("show");
};

window.closeGameModal = function() {
  document.getElementById("gameModal")?.classList.remove("show");
};

window.submitGameCategory = async function() {
  const game_code = document.getElementById("gameCodeInput")?.value.trim().toLowerCase();
  const title = document.getElementById("gameTitleInput")?.value.trim();
  const developer = document.getElementById("gameDevInput")?.value.trim() || "Official Publisher";
  const image_url = document.getElementById("gameImgInput")?.value.trim();
  const is_popular = document.getElementById("gameIsPopular")?.checked || false;

  if (!game_code || !title || !image_url) return alert("Kode game, nama game, dan URL cover wajib diisi!");

  const btn = document.getElementById("btnSubmitGame");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

  try {
    const { error } = await window.supabase.from("game_categories").upsert([
      { game_code, title, developer, image_url, is_popular, updated_at: new Date().toISOString() }
    ], { onConflict: 'game_code' });

    if (error) throw error;
    alert("Cover katalog game berhasil disimpan!");
    window.closeGameModal();
    window.fetchAdminGames();
  } catch (err) {
    alert("Gagal menyimpan game: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Katalog Game';
  }
};

window.toggleGamePopular = async function(id, status) {
  const { error } = await window.supabase.from("game_categories").update({ is_popular: status }).eq("id", id);
  if (error) alert("Gagal update status: " + error.message);
  else window.fetchAdminGames();
};

window.deleteGameCategory = async function(id) {
  if (!confirm("Hapus cover game ini dari katalog?")) return;
  const { error } = await window.supabase.from("game_categories").delete().eq("id", id);
  if (error) alert("Gagal menghapus game: " + error.message);
  else window.fetchAdminGames();
};

// --- FLASH SALE MODAL & ACTIONS ---
window.openFlashSaleModal = function() {
  const select = document.getElementById("flashSkuSelect");
  if (select && allProducts.length > 0) {
    select.innerHTML = '<option value="">-- Pilih Produk --</option>' + 
      allProducts.map(p => `<option value="${p.buyer_sku_code}">${p.brand || p.game_code} - ${p.product_name} (Rp ${Number(p.price_sell).toLocaleString("id-ID")})</option>`).join("");
  }
  document.getElementById("flashPriceInput").value = "";
  document.getElementById("flashDiscountInput").value = "-20%";
  document.getElementById("flashEndInput").value = "";
  document.getElementById("flashSaleModal")?.classList.add("show");
};

window.closeFlashSaleModal = function() {
  document.getElementById("flashSaleModal")?.classList.remove("show");
};

window.submitFlashSale = async function() {
  const buyer_sku_code = document.getElementById("flashSkuSelect")?.value;
  const flash_price = Number(document.getElementById("flashPriceInput")?.value);
  const discount_label = document.getElementById("flashDiscountInput")?.value.trim() || "-15%";
  const end_time = document.getElementById("flashEndInput")?.value;

  if (!buyer_sku_code || !flash_price || !end_time) return alert("Semua kolom flash sale wajib diisi!");

  const btn = document.getElementById("btnSubmitFlash");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menerbitkan...';

  try {
    const { error } = await window.supabase.from("flash_sales").insert([
      { buyer_sku_code, flash_price, discount_label, end_time: new Date(end_time).toISOString(), is_active: true }
    ]);
    if (error) throw error;
    alert("Item promo Flash Sale berhasil diterbitkan!");
    window.closeFlashSaleModal();
    window.fetchAdminFlashSale();
  } catch (err) {
    alert("Gagal menerbitkan Flash Sale: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Terbitkan Flash Sale';
  }
};

window.toggleFlashSaleStatus = async function(id, status) {
  const { error } = await window.supabase.from("flash_sales").update({ is_active: status }).eq("id", id);
  if (error) alert("Gagal update status: " + error.message);
  else window.fetchAdminFlashSale();
};

window.deleteFlashSale = async function(id) {
  if (!confirm("Hapus item flash sale ini?")) return;
  const { error } = await window.supabase.from("flash_sales").delete().eq("id", id);
  if (error) alert("Gagal menghapus flash sale: " + error.message);
  else window.fetchAdminFlashSale();
};

// ==========================================
// 2. MAIN DOM INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  const authLoader = document.getElementById("adminAuthLoader");

  if (!window.supabase) {
    alert("Koneksi Supabase belum siap.");
    window.location.href = "/auth/login.html";
    return;
  }

  function hideLoader() {
    if (authLoader) authLoader.style.display = "none";
  }

  async function initAdmin() {
    try {
      const { data: sessionData } = await window.supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        alert("Silakan login sebagai Admin terlebih dahulu!");
        window.location.href = "/auth/login.html";
        return;
      }

      const { data: profile, error: profErr } = await window.supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profErr || !profile || profile.role !== "admin") {
        alert("Akses Ditolak! Anda bukan Administrator.");
        window.location.href = "/dashboard.html";
        return;
      }

      await window.loadDashboardData();
      await window.fetchAdminArticles();
      await window.fetchAdminProducts(false); // preload list produk
      hideLoader();
    } catch (e) {
      console.error("Admin init error:", e);
      hideLoader();
    }
  }

  // Logout Handler
  const btnLogout = document.getElementById("btnAdminLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await window.supabase.auth.signOut();
      localStorage.removeItem("mgs_user");
      window.location.href = "/auth/login.html";
    });
  }

  // Sidebar Tab Switcher
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const targetContent = document.getElementById(btn.dataset.tab);
      if (targetContent) targetContent.classList.add("active");

      // Lazy Data Fetching
      if (btn.dataset.tab === "dashboardTab") window.loadDashboardData();
      if (btn.dataset.tab === "articlesTab") window.fetchAdminArticles();
      if (btn.dataset.tab === "productsTab") window.fetchAdminProducts();
      if (btn.dataset.tab === "bannersTab") window.fetchAdminBanners();
      if (btn.dataset.tab === "gamesTab") window.fetchAdminGames();
      if (btn.dataset.tab === "flashSaleTab") window.fetchAdminFlashSale();
    });
  });

  // ==========================================
  // FETCH STATISTIK & PESANAN
  // ==========================================
  window.loadDashboardData = async function() {
    const { data: orders, error: ordErr } = await window.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordErr && orders) {
      allOrders = orders;
      renderStats(orders);
      renderOrdersTable(orders);
    }

    const { data: users, error: userErr } = await window.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!userErr && users) {
      allUsers = users;
      const statTotalUsers = document.getElementById("statTotalUsers");
      if (statTotalUsers) statTotalUsers.innerText = users.length;
      renderUsersTable(users);
    }
  };

  function renderStats(orders) {
    let totalRev = 0;
    let totalProfit = 0;
    let successCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const gameSalesMap = {};
    const paymentMap = {};

    orders.forEach((o) => {
      const priceSell = Number(o.price || 0);
      const paymentMethod = o.payment_method || "Lainnya";

      if (o.status === "SUCCESS") {
        totalRev += priceSell;
        successCount++;
        const baseCost = Number(o.base_price || (priceSell * 0.9)); 
        totalProfit += (priceSell - baseCost);

        const gameName = o.game_title || o.game_code || "Lainnya";
        gameSalesMap[gameName] = (gameSalesMap[gameName] || 0) + 1;
        paymentMap[paymentMethod] = (paymentMap[paymentMethod] || 0) + 1;
      } else if (o.status === "PENDING") {
        pendingCount++;
      } else if (o.status === "CANCELLED" || o.status === "EXPIRED") {
        cancelledCount++;
      }
    });

    if (document.getElementById("statTotalRevenue")) document.getElementById("statTotalRevenue").innerText = `Rp ${totalRev.toLocaleString("id-ID")}`;
    if (document.getElementById("statTotalProfit")) document.getElementById("statTotalProfit").innerText = `Rp ${Math.round(totalProfit).toLocaleString("id-ID")}`;
    if (document.getElementById("statSuccessOrders")) document.getElementById("statSuccessOrders").innerText = successCount;
    if (document.getElementById("statPendingOrders")) document.getElementById("statPendingOrders").innerText = pendingCount;
    if (document.getElementById("statCancelledOrders")) document.getElementById("statCancelledOrders").innerText = cancelledCount;

    renderTopGames(gameSalesMap, successCount);
    renderPaymentStats(paymentMap, successCount);
  }

  function renderTopGames(gameSalesMap, totalSuccess) {
    const container = document.getElementById("topGamesContainer");
    if (!container) return;

    const sortedGames = Object.entries(gameSalesMap).sort((a, b) => b[1] - a[1]);
    if (sortedGames.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Belum ada pesanan sukses untuk direkap.</p>`;
      return;
    }

    container.innerHTML = sortedGames.map(([gameName, count], index) => {
      const percentage = totalSuccess > 0 ? Math.round((count / totalSuccess) * 100) : 0;
      const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
      return `
        <div class="top-game-card">
          <div class="top-game-info">
            <span class="top-game-title"><span>${rankIcon}</span> ${gameName}</span>
            <span class="top-game-count">${count} Order (${percentage}%)</span>
          </div>
          <div class="top-game-bar-bg">
            <div class="top-game-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderPaymentStats(paymentMap, totalSuccess) {
    const container = document.getElementById("topPaymentContainer");
    if (!container) return;

    const sortedPayments = Object.entries(paymentMap).sort((a, b) => b[1] - a[1]);
    if (sortedPayments.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Belum ada data pembayaran sukses.</p>`;
      return;
    }

    container.innerHTML = sortedPayments.map(([method, count]) => {
      const percentage = totalSuccess > 0 ? Math.round((count / totalSuccess) * 100) : 0;
      return `
        <div class="top-game-card">
          <div class="top-game-info">
            <span class="top-game-title"><i class="fa-solid fa-wallet" style="color: #38bdf8;"></i> ${method}</span>
            <span class="top-game-count" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.1);">${count}x (${percentage}%)</span>
          </div>
          <div class="top-game-bar-bg">
            <div class="top-game-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #38bdf8, #818cf8);"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderOrdersTable(orders) {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;
    const filter = document.getElementById("filterStatus").value;
    const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 25px;">Tidak ada transaksi ditemukan.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((o) => {
      const statusClass = (o.status || "PENDING").toLowerCase();
      const dateStr = new Date(o.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
      const targetAcc = o.zone_id ? `${o.account_id} (${o.zone_id})` : o.account_id;

      return `
        <tr>
          <td><strong style="color: #fff;">${o.invoice}</strong></td>
          <td>${dateStr}</td>
          <td>${o.game_title || o.game_code} - ${o.item_name}</td>
          <td><code>${targetAcc}</code></td>
          <td>Rp ${Number(o.price).toLocaleString("id-ID")}</td>
          <td>${o.payment_method}</td>
          <td><span class="badge-status ${statusClass}">${o.status}</span></td>
          <td>
            <div class="btn-action-group">
              ${o.status !== "SUCCESS" ? `<button class="btn-action-sm btn-success" title="Tandai Sukses" onclick="updateOrderStatus('${o.id}', 'SUCCESS')"><i class="fa-solid fa-check"></i></button>` : ""}
              ${o.status !== "CANCELLED" ? `<button class="btn-action-sm btn-cancel" title="Batalkan Pesanan" onclick="updateOrderStatus('${o.id}', 'CANCELLED')"><i class="fa-solid fa-xmark"></i></button>` : ""}
              <button class="btn-action-sm btn-wa" title="Kirim Struk ke WhatsApp" onclick="openWhatsAppReceipt('${o.id}')">
                <i class="fa-brands fa-whatsapp"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  const filterStatusEl = document.getElementById("filterStatus");
  if (filterStatusEl) filterStatusEl.addEventListener("change", () => renderOrdersTable(allOrders));

  const btnRefresh = document.getElementById("btnRefreshOrders");
  if (btnRefresh) btnRefresh.addEventListener("click", () => window.loadDashboardData());

  // ==========================================
  // MANAJEMEN SALDO MEMBER
  // ==========================================
  function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;
    const keyword = (document.getElementById("searchUser")?.value || "").toLowerCase();

    const filtered = users.filter((u) => 
      (u.full_name && u.full_name.toLowerCase().includes(keyword)) ||
      (u.email && u.email.toLowerCase().includes(keyword))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 25px;">Member tidak ditemukan.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((u) => {
      const bal = Number(u.balance || 0).toLocaleString("id-ID");
      return `
        <tr>
          <td><strong style="color: #fff;">${u.full_name || "Tanpa Nama"}</strong></td>
          <td>${u.email || "-"}</td>
          <td><span style="color: ${u.role === 'admin' ? '#10b981' : '#8e9bb0'}; font-weight: 700;">${u.role || 'member'}</span></td>
          <td><strong style="color: #10b981;">Rp ${bal}</strong></td>
          <td>
            <button class="btn-action-sm btn-adjust" onclick="openBalanceModal('${u.id}', '${(u.full_name || u.email || '').replace(/'/g, "\\'")}')">
              <i class="fa-solid fa-pen-to-square"></i> Kelola Saldo
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  const searchUserEl = document.getElementById("searchUser");
  if (searchUserEl) searchUserEl.addEventListener("input", () => renderUsersTable(allUsers));

  const balanceModal = document.getElementById("balanceModal");
  const btnCloseBal = document.getElementById("btnCloseBalModal");
  if (btnCloseBal) btnCloseBal.addEventListener("click", () => balanceModal.classList.remove("show"));

  const btnSubmitBal = document.getElementById("btnSubmitBalance");
  if (btnSubmitBal) {
    btnSubmitBal.addEventListener("click", async () => {
      const amount = Number(document.getElementById("modalAmountInput").value);
      if (!amount || isNaN(amount)) return alert("Masukkan nominal yang valid!");

      const { error } = await window.supabase.rpc("admin_adjust_balance", {
        target_user_id: selectedTargetUser,
        amount: amount
      });

      if (error) {
        alert("Gagal update saldo: " + error.message);
      } else {
        alert("Saldo member berhasil diperbarui!");
        balanceModal.classList.remove("show");
        window.loadDashboardData();
      }
    });
  }

  // ==========================================
  // MANAJEMEN BANNER PROMO (TAB BANNER)
  // ==========================================
  window.fetchAdminBanners = async function() {
    const tbody = document.getElementById("bannersTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 25px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat slider banner...</td></tr>`;

    try {
      const { data, error } = await window.supabase.from("banners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      allBanners = data || [];

      if (allBanners.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 25px; color: #94a3b8;">Belum ada banner promo. Klik "Tambah Banner Baru".</td></tr>`;
        return;
      }

      tbody.innerHTML = allBanners.map(b => {
        const statusBadge = b.is_active 
          ? `<span class="badge-status success">AKTIF</span>` 
          : `<span class="badge-status cancelled">NONAKTIF</span>`;

        return `
          <tr>
            <td><img src="${b.image_url}" alt="${b.title}" style="width: 120px; height: 55px; border-radius: 6px; object-fit: cover; background: #0b1120;"></td>
            <td><strong style="color: #fff;">${b.title}</strong></td>
            <td><code style="color: #38bdf8;">${b.target_url}</code></td>
            <td>${statusBadge}</td>
            <td>
              <div class="btn-action-group">
                <button class="btn-action-sm ${b.is_active ? 'btn-adjust' : 'btn-success'}" onclick="toggleBannerStatus('${b.id}', ${!b.is_active})" title="${b.is_active ? 'Nonaktifkan' : 'Aktifkan'}">
                  <i class="fa-solid ${b.is_active ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
                <button class="btn-action-sm btn-cancel" onclick="deleteBanner('${b.id}')" title="Hapus Banner">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">${err.message}</td></tr>`;
    }
  };

  // ==========================================
  // MANAJEMEN COVER KATALOG GAME (TAB GAMES)
  // ==========================================
  window.fetchAdminGames = async function() {
    const tbody = document.getElementById("gamesTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat katalog game...</td></tr>`;

    try {
      const { data, error } = await window.supabase.from("game_categories").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      allGameCategories = data || [];

      if (allGameCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: #94a3b8;">Belum ada cover game yang dikustom. Klik "Tambah / Set Cover Game".</td></tr>`;
        return;
      }

      tbody.innerHTML = allGameCategories.map(g => {
        const popBadge = g.is_popular 
          ? `<span class="badge-status success"><i class="fa-solid fa-fire"></i> POPULER</span>` 
          : `<span class="badge-status pending">BIASA</span>`;

        return `
          <tr>
            <td><img src="${g.image_url}" alt="${g.title}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover; background: #0b1120;"></td>
            <td><code style="color: #fbbf24; font-weight: 700;">${g.game_code}</code></td>
            <td><strong style="color: #fff;">${g.title}</strong></td>
            <td><span style="color: #94a3b8;">${g.developer}</span></td>
            <td>${popBadge}</td>
            <td>
              <div class="btn-action-group">
                <button class="btn-action-sm ${g.is_popular ? 'btn-adjust' : 'btn-success'}" onclick="toggleGamePopular('${g.id}', ${!g.is_popular})" title="Ubah Populer">
                  <i class="fa-solid fa-star"></i>
                </button>
                <button class="btn-action-sm btn-cancel" onclick="deleteGameCategory('${g.id}')" title="Hapus Game">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red);">${err.message}</td></tr>`;
    }
  };

  // ==========================================
  // MANAJEMEN PROMO FLASH SALE (TAB FLASH SALE)
  // ==========================================
  window.fetchAdminFlashSale = async function() {
    const tbody = document.getElementById("flashSaleTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat flash sale...</td></tr>`;

    try {
      const { data, error } = await window.supabase
        .from("flash_sales")
        .select(`*, products (product_name, brand, price_sell)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      allFlashSales = data || [];

      if (allFlashSales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: #94a3b8;">Belum ada item Flash Sale aktif. Klik "Tambah Item Flash Sale".</td></tr>`;
        return;
      }

      tbody.innerHTML = allFlashSales.map(fs => {
        const prodName = fs.products?.product_name || fs.buyer_sku_code;
        const brand = fs.products?.brand || "";
        const normalPrice = Number(fs.products?.price_sell || 0).toLocaleString("id-ID");
        const flashPrice = Number(fs.flash_price || 0).toLocaleString("id-ID");
        const endDate = new Date(fs.end_time).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
        const statusBadge = fs.is_active ? `<span class="badge-status success">LIVE</span>` : `<span class="badge-status cancelled">EXPIRED</span>`;

        return `
          <tr>
            <td><strong style="color: #fff;">${brand} - ${prodName}</strong></td>
            <td><del style="color: #94a3b8;">Rp ${normalPrice}</del></td>
            <td><strong style="color: #f59e0b; font-size: 0.95rem;">Rp ${flashPrice}</strong></td>
            <td><span class="badge-status pending" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">${fs.discount_label}</span></td>
            <td><span style="color: #94a3b8; font-size: 0.8rem;"><i class="fa-solid fa-clock"></i> ${endDate}</span></td>
            <td>${statusBadge}</td>
            <td>
              <div class="btn-action-group">
                <button class="btn-action-sm ${fs.is_active ? 'btn-adjust' : 'btn-success'}" onclick="toggleFlashSaleStatus('${fs.id}', ${!fs.is_active})" title="Toggle Live">
                  <i class="fa-solid ${fs.is_active ? 'fa-pause' : 'fa-play'}"></i>
                </button>
                <button class="btn-action-sm btn-cancel" onclick="deleteFlashSale('${fs.id}')" title="Hapus Promo">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--accent-red);">${err.message}</td></tr>`;
    }
  };

  // ==========================================
  // MANAJEMEN KATALOG PRODUK & HARGA (TAB 4)
  // ==========================================
  window.fetchAdminProducts = async function(renderTable = true) {
    const tbody = document.getElementById("productsTableBody");
    if (tbody && renderTable) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data produk...</td></tr>`;
    }

    try {
      const { data, error } = await window.supabase
        .from("products")
        .select("*")
        .order("brand", { ascending: true })
        .order("price_sell", { ascending: true });

      if (error) throw error;
      allProducts = data || [];
      if (renderTable) {
        populateGameFilters(allProducts);
        renderProductsTable(allProducts);
      }
    } catch (err) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--accent-red);">Gagal mengambil data: ${err.message}</td></tr>`;
    }
  };

  function populateGameFilters(products) {
    const filterSelect = document.getElementById("filterProductGame");
    const pillsContainer = document.getElementById("gameCategoryPills");
    const uniqueGames = [...new Set(products.map(p => p.brand || p.game_code || "Lainnya"))].sort();

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="ALL">🎮 Semua Game (${products.length})</option>` +
        uniqueGames.map(g => {
          const count = products.filter(p => (p.brand || p.game_code) === g).length;
          return `<option value="${g}" ${activeGameFilter === g ? "selected" : ""}>${g.toUpperCase()} (${count})</option>`;
        }).join("");
    }

    if (pillsContainer) {
      pillsContainer.innerHTML = `
        <button class="pill-btn ${activeGameFilter === 'ALL' ? 'active' : ''}" onclick="setGameFilter('ALL')">
          Semua (${products.length})
        </button>
      ` + uniqueGames.map(g => {
        const count = products.filter(p => (p.brand || p.game_code) === g).length;
        const isActive = activeGameFilter === g ? 'active' : '';
        return `
          <button class="pill-btn ${isActive}" onclick="setGameFilter('${g.replace(/'/g, "\\'")}')">
            ${g.toUpperCase()} <span style="opacity: 0.7; font-size: 0.75rem;">${count}</span>
          </button>
        `;
      }).join("");
    }
  }

  function renderProductsTable(products) {
    const tbody = document.getElementById("productsTableBody");
    if (!tbody) return;
    const keyword = (document.getElementById("searchProductAdmin")?.value || "").toLowerCase();

    const filtered = products.filter((p) => {
      const brandName = p.brand || p.game_code || "Lainnya";
      const matchCategory = (activeGameFilter === "ALL") || (brandName === activeGameFilter);
      const matchKeyword = (p.product_name && p.product_name.toLowerCase().includes(keyword)) ||
                           (p.buyer_sku_code && p.buyer_sku_code.toLowerCase().includes(keyword)) ||
                           (brandName.toLowerCase().includes(keyword));

      return matchCategory && matchKeyword;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);">Tidak ada produk untuk kategori ini.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p) => {
      const basePriceNum = Number(p.price_original ?? p.price ?? 0);
      const sellPriceNum = Number(p.price_sell ?? 0);
      const basePrice = basePriceNum.toLocaleString("id-ID");
      const sellPrice = sellPriceNum.toLocaleString("id-ID");
      const statusBadge = p.buyer_product_status ? `<span class="badge-status success">ON</span>` : `<span class="badge-status pending" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">OFF</span>`;
      const safeEncodedTitle = encodeURIComponent(p.product_name || "");

      return `
        <tr>
          <td><code style="color: #94a3b8; font-size: 0.8rem;">${p.buyer_sku_code}</code></td>
          <td><span style="color: #fbbf24; font-weight: 700; text-transform: uppercase; font-size: 0.8rem;">${p.brand || p.game_code}</span></td>
          <td><strong style="color: #fff; font-size: 0.85rem;">${p.product_name}</strong></td>
          <td>Rp ${basePrice}</td>
          <td><strong style="color: #10b981;">Rp ${sellPrice}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn-action-sm btn-adjust" onclick="openPriceModal('${p.buyer_sku_code}', '${safeEncodedTitle}', ${basePriceNum}, ${sellPriceNum})" title="Ubah Harga Jual">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // --- EVENTS & FILTERS ---
  const filterProductGame = document.getElementById("filterProductGame");
  if (filterProductGame) {
    filterProductGame.addEventListener("change", (e) => {
      activeGameFilter = e.target.value;
      populateGameFilters(allProducts);
      renderProductsTable(allProducts);
    });
  }

  const searchProductAdmin = document.getElementById("searchProductAdmin");
  if (searchProductAdmin) searchProductAdmin.addEventListener("input", () => renderProductsTable(allProducts));

  const btnRefreshProducts = document.getElementById("btnRefreshProducts");
  if (btnRefreshProducts) btnRefreshProducts.addEventListener("click", () => window.fetchAdminProducts());

  const btnClosePriceModal = document.getElementById("btnClosePriceModal");
  const priceModal = document.getElementById("priceModal");
  if (btnClosePriceModal && priceModal) {
    btnClosePriceModal.addEventListener("click", () => priceModal.classList.remove("show"));
  }

  const btnSubmitPrice = document.getElementById("btnSubmitPrice");
  if (btnSubmitPrice) {
    btnSubmitPrice.addEventListener("click", async () => {
      const newPrice = Number(document.getElementById("modalSellPriceInput").value);
      if (!newPrice || isNaN(newPrice) || newPrice < 100) return alert("Masukkan harga jual yang valid!");

      btnSubmitPrice.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
      btnSubmitPrice.disabled = true;

      try {
        const { error } = await window.supabase.from("products").update({ price_sell: newPrice }).eq("buyer_sku_code", selectedSku);
        if (error) throw error;
        alert("Harga jual berhasil diupdate!");
        priceModal.classList.remove("show");
        window.fetchAdminProducts();
      } catch (err) {
        alert("Gagal update harga: " + err.message);
      } finally {
        btnSubmitPrice.innerHTML = '<i class="fa-solid fa-check"></i> Simpan Harga';
        btnSubmitPrice.disabled = false;
      }
    });
  }

  // ==========================================
  // MANAJEMEN ARTIKEL BLOG & SEO (TAB ARTIKEL)
  // ==========================================
  window.fetchAdminArticles = async function() {
    const articlesTbody = document.getElementById("adminArticlesTableBody");
    if (!articlesTbody) return;

    articlesTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat artikel blog...</td></tr>`;

    try {
      const { data: articles, error } = await window.supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      allArticles = articles || [];

      if (allArticles.length === 0) {
        articlesTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">Belum ada artikel.</td></tr>`;
        return;
      }

      articlesTbody.innerHTML = allArticles.map((art) => {
        const date = new Date(art.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        const isLive = art.is_published;
        const statusBadge = isLive
          ? `<span class="badge-status success" style="font-size: 0.72rem; padding: 3px 8px;"><i class="fa-solid fa-check"></i> LIVE</span>`
          : `<span class="badge-status pending" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(148, 163, 184, 0.2); color: #94a3b8;"><i class="fa-solid fa-box-archive"></i> DRAFT</span>`;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${art.thumbnail_url}" alt="${art.title}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #0f172a;">
                <div>
                  <strong style="color: #fff; font-size: 0.88rem; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 250px;">
                    ${art.title}
                  </strong>
                  <a href="/blog-detail.html?slug=${art.slug}" target="_blank" style="font-size: 0.74rem; color: #38bdf8; text-decoration: none;">
                    Lihat Artikel <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                </div>
              </div>
            </td>
            <td><span style="font-size: 0.8rem; color: #fbbf24; font-weight: 700;">${art.category}</span></td>
            <td><span style="font-size: 0.8rem; color: #cbd5e1;"><i class="fa-solid fa-eye"></i> ${art.views_count || 0}</span></td>
            <td>${statusBadge}</td>
            <td><span style="font-size: 0.78rem; color: var(--text-muted);">${date}</span></td>
            <td>
              <div class="btn-action-group">
                <button onclick="togglePublishArticle('${art.id}', ${!isLive})" title="${isLive ? 'Tarik ke Draft' : 'Publikasikan'}" class="btn-action-sm ${isLive ? 'btn-adjust' : 'btn-success'}">
                  <i class="fa-solid ${isLive ? 'fa-eye-slash' : 'fa-globe'}"></i>
                </button>
                <button onclick="deleteArticle('${art.id}', '${encodeURIComponent(art.title)}')" title="Hapus Artikel" class="btn-action-sm btn-cancel">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      articlesTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal mengambil artikel: ${err.message}</td></tr>`;
    }
  };

  initAdmin();
});