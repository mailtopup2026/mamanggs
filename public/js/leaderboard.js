document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) {
    console.error("Supabase client belum siap.");
    return;
  }

  // Sensor Nama Gamers
  function maskGamersName(name) {
    if (!name || name === "Gamers Sultan") return "Gamers Sultan";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      if (parts[0].length <= 3) return parts[0] + "***";
      return parts[0].slice(0, 3) + "***" + parts[0].slice(-1);
    }
    return parts[0] + " " + parts[1].charAt(0) + "***" + (parts[1].length > 1 ? parts[1].slice(-1) : "");
  }

  async function fetchLeaderboard() {
    const tbody = document.getElementById("leaderboardTbody");
    try {
      const { data, error } = await window.supabase.rpc("get_leaderboard_rankings");

      if (error) throw error;

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted);">Belum ada transaksi sukses dari member terdaftar.</td></tr>`;
        return;
      }

      renderPodium(data);
      renderLeaderboardTable(data);
    } catch (err) {
      console.error("Gagal load leaderboard:", err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal memuat leaderboard: ${err.message}</td></tr>`;
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
      p1.querySelector(".podium-name").innerText = maskGamersName(r1.player_name);
      p1.querySelector(".podium-spent").innerText = `Rp ${Number(r1.total_spent).toLocaleString("id-ID")}`;
    }
    if (p2 && r2) {
      p2.querySelector(".podium-name").innerText = maskGamersName(r2.player_name);
      p2.querySelector(".podium-spent").innerText = `Rp ${Number(r2.total_spent).toLocaleString("id-ID")}`;
    }
    if (p3 && r3) {
      p3.querySelector(".podium-name").innerText = maskGamersName(r3.player_name);
      p3.querySelector(".podium-spent").innerText = `Rp ${Number(r3.total_spent).toLocaleString("id-ID")}`;
    }
  }

  function renderLeaderboardTable(rankedUsers) {
    const tbody = document.getElementById("leaderboardTbody");
    if (!tbody) return;

    tbody.innerHTML = rankedUsers.map((user, index) => {
      const rank = index + 1;
      const rankBadge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<span class="rank-number-badge">${rank}</span>`;

      return `
        <tr>
          <td>${rankBadge}</td>
          <td><strong style="color: #fff;">${maskGamersName(user.player_name)}</strong></td>
          <td><i class="fa-solid fa-cart-shopping" style="color: #3b82f6; margin-right: 6px;"></i> ${user.order_count} Transaksi</td>
          <td><strong style="color: #10b981;">Rp ${Number(user.total_spent).toLocaleString("id-ID")}</strong></td>
        </tr>
      `;
    }).join("");
  }

  fetchLeaderboard();
});