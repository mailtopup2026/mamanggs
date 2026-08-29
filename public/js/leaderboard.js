document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("rankingsList");

  // Helper sensor nama
  function maskGamersName(name) {
    if (!name || name === "Gamers Sultan") return "Gamers Sultan";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      if (parts[0].length <= 3) return parts[0] + "***";
      return parts[0].slice(0, 3) + "***" + parts[0].slice(-1);
    }
    return parts[0] + " " + parts[1].charAt(0) + "***" + (parts[1].length > 1 ? parts[1].slice(-1) : "");
  }

  // Helper avatar 3D DiceBear
  function get3DAvatar(user, defaultSeed) {
    if (user && user.avatar_url && user.avatar_url.trim() !== "") return user.avatar_url;
    const seed = encodeURIComponent(user?.player_name || defaultSeed);
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
  }

  function renderPodium(rankedUsers) {
    const r1 = rankedUsers[0];
    const r2 = rankedUsers[1];
    const r3 = rankedUsers[2];

    // Reset default
    document.getElementById("nameRank1").innerText = "-";
    document.getElementById("scoreRank1").innerText = "Rp 0";
    document.getElementById("nameRank2").innerText = "-";
    document.getElementById("scoreRank2").innerText = "Rp 0";
    document.getElementById("nameRank3").innerText = "-";
    document.getElementById("scoreRank3").innerText = "Rp 0";

    // Rank 1
    if (r1) {
      document.getElementById("nameRank1").innerText = maskGamersName(r1.player_name);
      document.getElementById("scoreRank1").innerText = `Rp ${Number(r1.total_spent || 0).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank1").src = get3DAvatar(r1, "Jordyn");
    }

    // Rank 2
    if (r2) {
      document.getElementById("nameRank2").innerText = maskGamersName(r2.player_name);
      document.getElementById("scoreRank2").innerText = `Rp ${Number(r2.total_spent || 0).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank2").src = get3DAvatar(r2, "Alena");
    }

    // Rank 3
    if (r3) {
      document.getElementById("nameRank3").innerText = maskGamersName(r3.player_name);
      document.getElementById("scoreRank3").innerText = `Rp ${Number(r3.total_spent || 0).toLocaleString("id-ID")}`;
      document.getElementById("avatarRank3").src = get3DAvatar(r3, "Carl");
    }
  }

  function renderSheetList(rankedUsers) {
    if (!listContainer) return;

    const lowerRanks = rankedUsers.slice(3);

    if (lowerRanks.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">Peringkat 4–10 masih kosong. Jadilah sultan berikutnya!</div>`;
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
                Rp ${Number(user.total_spent || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div class="wreath-badge-sm">${rankNum}<sup>th</sup></div>
        </div>
      `;
    }).join("");
  }

  async function fetchLeaderboard() {
    if (!window.supabase) {
      if (listContainer) listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text-muted);">Memuat koneksi Supabase...</div>`;
      return;
    }

    try {
      // 1. Coba panggil via fungsi RPC
      let { data, error } = await window.supabase.rpc("get_leaderboard_rankings");

      // 2. Fallback jika RPC belum diupdate
      if (error || !data) {
        console.warn("RPC fetch failed, switching to direct query fallback:", error);
        
        const { data: orders, error: ordErr } = await window.supabase
          .from("orders")
          .select("user_id, price")
          .eq("status", "SUCCESS")
          .not("user_id", "is", null);

        if (ordErr) throw ordErr;

        const { data: profiles } = await window.supabase
          .from("profiles")
          .select("id, full_name, avatar_url");

        const profMap = {};
        (profiles || []).forEach(p => {
          profMap[p.id] = { name: p.full_name || "Gamers Sultan", avatar: p.avatar_url || "" };
        });

        const spendMap = {};
        (orders || []).forEach(o => {
          if (!spendMap[o.user_id]) {
            spendMap[o.user_id] = {
              user_id: o.user_id,
              player_name: profMap[o.user_id]?.name || "Gamers Sultan",
              avatar_url: profMap[o.user_id]?.avatar || "",
              order_count: 0,
              total_spent: 0
            };
          }
          spendMap[o.user_id].total_spent += Number(o.price || 0);
          spendMap[o.user_id].order_count += 1;
        });

        data = Object.values(spendMap).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);
      }

      if (!data || data.length === 0) {
        renderPodium([]);
        if (listContainer) {
          listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text-muted); font-size: 0.88rem;">Belum ada data transaksi sukses yang tercatat.</div>`;
        }
        return;
      }

      renderPodium(data);
      renderSheetList(data);
    } catch (err) {
      console.error("Gagal load leaderboard:", err);
      if (listContainer) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal memuat data: ${err.message}</div>`;
      }
    }
  }

  fetchLeaderboard();
});