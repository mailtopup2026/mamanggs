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

  // Generator Avatar 3D DiceBear Adventurer
  function get3DAvatar(user, defaultSeed) {
    if (user && user.avatar_url) return user.avatar_url;
    const seed = encodeURIComponent(user?.player_name || defaultSeed);
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
  }

  async function fetchLeaderboard() {
    const listContainer = document.getElementById("rankingsList");
    try {
      const { data, error } = await window.supabase.rpc("get_leaderboard_rankings");

      if (error) throw error;

      if (!data || data.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Belum ada data transaksi member.</div>`;
        return;
      }

      renderPodium(data);
      renderSheetList(data);
    } catch (err) {
      console.error("Gagal load leaderboard:", err);
      if (listContainer) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal memuat: ${err.message}</div>`;
      }
    }
  }

  function renderPodium(rankedUsers) {
    const r1 = rankedUsers[0];
    const r2 = rankedUsers[1];
    const r3 = rankedUsers[2];

    // Rank 1
    if (r1) {
      document.getElementById("nameRank1").innerText = maskGamersName(r1.player_name);
      document.getElementById("scoreRank1").innerText = `Rp ${Number(r1.total_spent).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank1").src = get3DAvatar(r1, "Jordyn");
    }

    // Rank 2
    if (r2) {
      document.getElementById("nameRank2").innerText = maskGamersName(r2.player_name);
      document.getElementById("scoreRank2").innerText = `Rp ${Number(r2.total_spent).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank2").src = get3DAvatar(r2, "Alena");
    }

    // Rank 3
    if (r3) {
      document.getElementById("nameRank3").innerText = maskGamersName(r3.player_name);
      document.getElementById("scoreRank3").innerText = `Rp ${Number(r3.total_spent).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank3").src = get3DAvatar(r3, "Carl");
    }
  }

  function renderSheetList(rankedUsers) {
    const listContainer = document.getElementById("rankingsList");
    if (!listContainer) return;

    // Ambil peringkat 4 ke bawah
    const lowerRanks = rankedUsers.slice(3);

    if (lowerRanks.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">Peringkat 4–10 masih kosong. Jadilah yang berikutnya!</div>`;
      return;
    }

    listContainer.innerHTML = lowerRanks.map((user, index) => {
      const rankNum = index + 4;
      const avatarSrc = get3DAvatar(user, `Player${rankNum}`);

      return `
        <div class="rank-row-item">
          <div class="rank-user-info">
            <img src="${avatarSrc}" alt="Avatar" class="rank-avatar-sm">
            <div class="rank-user-text">
              <span class="player-name">${maskGamersName(user.player_name)}</span>
              <span class="player-score">
                <i class="fa-solid fa-gem" style="font-size: 0.7rem;"></i>
                Rp ${Number(user.total_spent).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div class="wreath-badge-sm">${rankNum}<sup>th</sup></div>
        </div>
      `;
    }).join("");
  }

  fetchLeaderboard();
});