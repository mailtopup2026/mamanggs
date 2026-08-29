document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) {
    console.error("Supabase client belum siap.");
    return;
  }

  // Cek Status Login untuk Navbar
  async function checkUserSession() {
    try {
      const { data } = await window.supabase.auth.getSession();
      if (data?.session?.user) {
        const loginBtn = document.getElementById("navLoginBtn");
        const dashBtn = document.getElementById("navDashboardBtn");
        if (loginBtn) loginBtn.style.display = "none";
        if (dashBtn) dashBtn.style.display = "inline-flex";
      }
    } catch (e) {}
  }

  // Sensor Nama Gamers (Contoh: "Budi Santoso" -> "Budi S*****o")
  function maskGamersName(name) {
    if (!name) return "Gamers Sultan";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      if (parts[0].length <= 3) return parts[0] + "***";
      return parts[0].slice(0, 3) + "***" + parts[0].slice(-1);
    }
    return parts[0] + " " + parts[1].charAt(0) + "***" + (parts[1].length > 1 ? parts[1].slice(-1) : "");
  }

  // Fetch Transaksi & Hitung Leaderboard
  async function fetchLeaderboard() {
    try {
      // 1. Ambil seluruh pesanan berstatus SUCCESS yang memiliki user_id
      const { data: orders, error: ordErr } = await window.supabase
        .from("orders")
        .select("user_id, price")
        .eq("status", "SUCCESS")
        .not("user_id", "is", null);

      if (ordErr) throw ordErr;

      // 2. Ambil data profil member
      const { data: profiles, error: profErr } = await window.supabase
        .from("profiles")
        .select("id, full_name, email");

      if (profErr) throw profErr;

      // Petakan profil berdasarkan ID
      const userMap = {};
      (profiles || []).forEach((p) => {
        userMap[p.id] = p.full_name || p.email?.split("@")[0] || "Gamers";
      });

      // 3. Akumulasi Belanja per Member
      const spendMap = {};
      (orders || []).forEach((o) => {
        if (!spendMap[o.user_id]) {
          spendMap[o.user_id] = {
            totalSpent: 0,
            orderCount: 0,
            name: userMap[o.user_id] || "Gamers Sultan"
          };
        }
        spendMap[o.user_id].totalSpent += Number(o.price || 0);
        spendMap[o.user_id].orderCount += 1;
      });

      // Urutkan dari total belanja terbesar ke terkecil
      const rankedUsers = Object.values(spendMap).sort((a, b) => b.totalSpent - a.totalSpent);

      renderPodium(rankedUsers);
      renderLeaderboardTable(rankedUsers);
    } catch (err) {
      console.error("Gagal load leaderboard:", err);
      const tbody = document.getElementById("leaderboardTbody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal memuat leaderboard.</td></tr>`;
      }
    }
  }

  function renderPodium(rankedUsers) {
    const r1 = rankedUsers[0];
    const r2 = rankedUsers[1];
    const r3 = rankedUsers[2];

    const p1 = document.getElementById("podiumRank1");
    const p2 = document.getElementById("podiumRank2");
    const p3 = document.getElementById("podiumRank3");

    if (p1 && r1) {
      p1.querySelector(".podium-name").innerText = maskGamersName(r1.name);
      p1.querySelector(".podium-spent").innerText = `Rp ${r1.totalSpent.toLocaleString("id-ID")}`;
    }
    if (p2 && r2) {
      p2.querySelector(".podium-name").innerText = maskGamersName(r2.name);
      p2.querySelector(".podium-spent").innerText = `Rp ${r2.totalSpent.toLocaleString("id-ID")}`;
    }
    if (p3 && r3) {
      p3.querySelector(".podium-name").innerText = maskGamersName(r3.name);
      p3.querySelector(".podium-spent").innerText = `Rp ${r3.totalSpent.toLocaleString("id-ID")}`;
    }
  }

  function renderLeaderboardTable(rankedUsers) {
    const tbody = document.getElementById("leaderboardTbody");
    if (!tbody) return;

    if (rankedUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted);">Belum ada data transaksi member untuk ditampilkan.</td></tr>`;
      return;
    }

    tbody.innerHTML = rankedUsers.map((user, index) => {
      const rank = index + 1;
      const rankBadge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<span class="rank-number-badge">${rank}</span>`;

      return `
        <tr>
          <td>${rankBadge}</td>
          <td><strong style="color: #fff;">${maskGamersName(user.name)}</strong></td>
          <td><i class="fa-solid fa-cart-shopping" style="color: #3b82f6; margin-right: 6px;"></i> ${user.orderCount} Transaksi</td>
          <td><strong style="color: #10b981;">Rp ${user.totalSpent.toLocaleString("id-ID")}</strong></td>
        </tr>
      `;
    }).join("");
  }

  checkUserSession();
  fetchLeaderboard();
});