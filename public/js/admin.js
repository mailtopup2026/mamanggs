document.addEventListener("DOMContentLoaded", async () => {
  const authLoader = document.getElementById("adminAuthLoader");
  const mainContent = document.getElementById("adminMainContent");
  const adminNavbar = document.getElementById("adminNavbar");

  if (!window.supabase) {
    alert("Koneksi Supabase belum siap.");
    window.location.href = "/auth/login.html";
    return;
  }

  // Fungsi Verifikasi & Load Seluruh Data Sebelum Tampilan Dibuka
  async function initAdmin() {
    try {
      const { data: sessionData } = await window.supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        alert("Silakan login sebagai Admin terlebih dahulu!");
        window.location.href = "/auth/login.html";
        return;
      }

      // Verifikasi role akun
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

      // Ambil dan render data sebelum membuka layar
      await loadDashboardData();

      // Buka tampilan setelah data 100% siap
      if (authLoader) authLoader.style.display = "none";
      if (adminNavbar) {
        adminNavbar.style.visibility = "visible";
        adminNavbar.style.opacity = "1";
      }
      if (mainContent) {
        mainContent.style.visibility = "visible";
        mainContent.style.opacity = "1";
      }
    } catch (e) {
      console.error("Admin init error:", e);
      if (authLoader) authLoader.style.display = "none";
    }
  }

  // Logout Handler
  document.getElementById("btnAdminLogout").addEventListener("click", async () => {
    await window.supabase.auth.signOut();
    localStorage.removeItem("mgs_user");
    window.location.href = "/auth/login.html";
  });

  // Tab Switcher
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // ==========================================
  // FETCH STATISTIK & PESANAN
  // ==========================================
  let allOrders = [];
  let allUsers = [];
  let selectedTargetUser = null;

  async function loadDashboardData() {
    // 1. Fetch Orders
    const { data: orders, error: ordErr } = await window.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordErr && orders) {
      allOrders = orders;
      renderStats(orders);
      renderOrdersTable(orders);
    }

    // 2. Fetch Users
    const { data: users, error: userErr } = await window.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!userErr && users) {
      allUsers = users;
      document.getElementById("statTotalUsers").innerText = users.length;
      renderUsersTable(users);
    }
  }

 function renderStats(orders) {
    let totalRev = 0;
    let pendingCount = 0;
    const gameSalesMap = {};
    let totalSuccessCount = 0;

    orders.forEach((o) => {
      if (o.status === "SUCCESS") {
        totalRev += Number(o.price || 0);
        totalSuccessCount++;

        // Hitung akumulasi order per game
        const gameName = o.game_title || o.game_code || "Lainnya";
        gameSalesMap[gameName] = (gameSalesMap[gameName] || 0) + 1;
      } else if (o.status === "PENDING") {
        pendingCount++;
      }
    });

    document.getElementById("statTotalRevenue").innerText = `Rp ${totalRev.toLocaleString("id-ID")}`;
    document.getElementById("statTotalOrders").innerText = orders.length;
    document.getElementById("statPendingOrders").innerText = pendingCount;

    // Render Widget Peringkat Game Terlaris
    renderTopGames(gameSalesMap, totalSuccessCount);
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

  // Update Status Pesanan
  window.updateOrderStatus = async (orderId, newStatus) => {
    if (!confirm(`Ubah status pesanan ini menjadi ${newStatus}?`)) return;

    const { error } = await window.supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      loadDashboardData();
    }
  };

  // Filter & Refresh Event
  document.getElementById("filterStatus").addEventListener("change", () => renderOrdersTable(allOrders));
  document.getElementById("btnRefreshOrders").addEventListener("click", loadDashboardData);

  // ==========================================
  // MANAJEMEN SALDO MEMBER
  // ==========================================
  function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    const keyword = document.getElementById("searchUser").value.toLowerCase();

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
            <button class="btn-action-sm btn-adjust" onclick="openBalanceModal('${u.id}', '${u.full_name || u.email}')">
              <i class="fa-solid fa-pen-to-square"></i> Kelola Saldo
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  document.getElementById("searchUser").addEventListener("input", () => renderUsersTable(allUsers));

  // Modal Balance Logic
  const balanceModal = document.getElementById("balanceModal");
  window.openBalanceModal = (userId, name) => {
    selectedTargetUser = userId;
    document.getElementById("modalUserName").innerText = name;
    document.getElementById("modalAmountInput").value = "";
    balanceModal.classList.add("show");
  };

  document.getElementById("btnCloseBalModal").addEventListener("click", () => {
    balanceModal.classList.remove("show");
  });

  document.getElementById("btnSubmitBalance").addEventListener("click", async () => {
    const amount = Number(document.getElementById("modalAmountInput").value);
    if (!amount || isNaN(amount)) {
      alert("Masukkan nominal penambahan / pengurangan yang valid!");
      return;
    }

    const { error } = await window.supabase.rpc("admin_adjust_balance", {
      target_user_id: selectedTargetUser,
      amount: amount
    });

    if (error) {
      alert("Gagal update saldo: " + error.message);
    } else {
      alert("Saldo member berhasil diperbarui!");
      balanceModal.classList.remove("show");
      loadDashboardData();
    }
  });

  // Eksekusi inisialisasi
  initAdmin();
});