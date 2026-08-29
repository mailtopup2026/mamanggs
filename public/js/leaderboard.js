document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("rankingsList");

  // Fungsi untuk mendapatkan client Supabase yang aktif
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  // Sensor nama gamers
  function maskGamersName(name) {
    if (!name || name === "Gamers Sultan") return "Gamers Sultan";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      if (parts[0].length <= 3) return parts[0] + "***";
      return parts[0].slice(0, 3) + "***" + parts[0].slice(-1);
    }
    return parts[0] + " " + parts[1].charAt(0) + "***" + (parts[1].length > 1 ? parts[1].slice(-1) : "");
  }

  // Generator Avatar 3D
  function get3DAvatar(user, defaultSeed) {
    if (user && user.avatar_url && user.avatar_url.trim() !== "") return user.avatar_url;
    const seed = encodeURIComponent(user?.player_name || defaultSeed);
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
  }

  function renderPodium(rankedUsers) {
    const r1 = rankedUsers[0];
    const r2 = rankedUsers[1];
    const r3 = rankedUsers[2];

    const n1 = document.getElementById("nameRank1");
    const s1 = document.getElementById("scoreRank1");
    const a1 = document.getElementById("avatarRank1");

    const n2 = document.getElementById("nameRank2");
    const s2 = document.getElementById("scoreRank2");
    const a2 = document.getElementById("avatarRank2");

    const n3 = document.getElementById("nameRank3");
    const s3 = document.getElementById("scoreRank3");
    const a3 = document.getElementById("avatarRank3");

    if (r1) {
      if (n1) n1.innerText = maskGamersName(r1.player_name);
      if (s1) s1.innerText = `Rp ${Number(r1.total_spent || 0).toLocaleString("id-ID")}`;
      if (a1) a1.src = get3DAvatar(r1, "Jordyn");
    }

    if (r2) {
      if (n2) n2.innerText = maskGamersName(r2.player_name);
      if (s2) s2.innerText = `Rp ${Number(r2.total_spent || 0).toLocaleString("id-ID")}`;
      if (a2) a2.src = get3DAvatar(r2, "Alena");
    }

    if (r3) {
      if (n3) n3.innerText = maskGamersName(r3.player_name);
      if (s3) s3.innerText = `Rp ${Number(r3.total_spent || 0).toLocaleString("id-ID")}`;
      if (a3) a3.src = get3DAvatar(r3, "Carl");
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
          <div class="trophy-badge-sm">
            <i class="fa-solid fa-trophy" style="font-size: 0.75rem;"></i>
            ${rankNum}<sup>th</sup>
          </div>
        </div>
      `;
    }).join("");
  }

  async function fetchLeaderboard() {
    const client = getClient();
    if (!client) {
      setTimeout(fetchLeaderboard, 200);
      return;
    }

    try {
      let data = null;

      // Cek apakah fungsi rpc tersedia
      if (typeof client.rpc === "function") {
        const res = await client.rpc("get_leaderboard_rankings");
        if (!res.error && res.data && res.data.length > 0) {
          data = res.data;
        }
      }

      // Fallback query langsung jika RPC gagal atau tidak ada
      if (!data) {
        const { data: orders, error: ordErr } = await client
          .from("orders")
          .select("user_id, price")
          .eq("status", "SUCCESS")
          .not("user_id", "is", null);

        if (ordErr) throw ordErr;

        const { data: profiles } = await client
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
      console.error("Gagal memuat leaderboard:", err);
      if (listContainer) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--accent-red);">Gagal memuat data: ${err.message}</div>`;
      }
    }
  }

  fetchLeaderboard();
});