document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("mgs_user");
  if (!storedUser) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = JSON.parse(storedUser);

  // Daftar kamus icon game untuk render badge di dashboard
  const gameDictionary = {
    MLBB: { name: "MLBB", icon: "fa-solid fa-shield-halved" },
    PUBG: { name: "PUBG Mobile", icon: "fa-solid fa-crosshairs" },
    FF: { name: "Free Fire", icon: "fa-solid fa-fire" },
    VALO: { name: "Valorant", icon: "fa-solid fa-skull" },
    DOTA: { name: "Dota 2", icon: "fa-solid fa-khanda" },
    GENSHIN: { name: "Genshin", icon: "fa-solid fa-wind" },
    HOK: { name: "HOK", icon: "fa-solid fa-crown" },
    ROBLOX: { name: "Roblox", icon: "fa-solid fa-cubes" },
    WOS: { name: "Whiteout", icon: "fa-solid fa-snowflake" }
  };

  // Pasang data awal dari metadata login
  const initialName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
  document.getElementById("profileName").innerText = initialName;
  document.getElementById("profileEmail").innerText = user.email || "";

  // Sinkronisasi data real-time dengan Supabase
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      loadUserProfile(user.id);
      loadOrderHistory(user.id);
    }
  }, 100);

  // Ambil saldo, role, avatar 3d, dan game favorit dari profiles
  async function loadUserProfile(userId) {
    try {
      const { data, error } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.full_name) document.getElementById("profileName").innerText = data.full_name;
        if (data.email) document.getElementById("profileEmail").innerText = data.email;

        // 1. Update Avatar 3D
        const userAvatarImg = document.getElementById("userAvatarImg");
        if (userAvatarImg) {
          const avatarUrl = data.avatar_url && data.avatar_url.trim() !== "" 
            ? data.avatar_url 
            : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.full_name || "Member")}&radius=50`;
          userAvatarImg.src = avatarUrl;
        }

        // 2. Render Badge Game Favorit di Dashboard
        const dashboardBadges = document.getElementById("dashboardBadges");
        if (dashboardBadges) {
          const favGames = Array.isArray(data.favorite_games) ? data.favorite_games : [];
          if (favGames.length > 0) {
            dashboardBadges.innerHTML = favGames.map(code => {
              const g = gameDictionary[code] || { name: code, icon: "fa-solid fa-gamepad" };
              return `
                <span style="display: inline-flex; align-items: center; gap: 5px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(245, 158, 11, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800; color: #fff;">
                  <i class="${g.icon}" style="color: #f59e0b; font-size: 0.75rem;"></i> ${g.name}
                </span>
              `;
            }).join("");
          } else {
            dashboardBadges.innerHTML = "";
          }
        }

        // 3. Saldo & Role
        const balance = Number(data.balance || 0).toLocaleString("id-ID");
        document.getElementById("walletBalance").innerText = `Rp ${balance}`;

        const rolePill = document.getElementById("profileRole");
        const role = (data.role || "MEMBER").toUpperCase();
        rolePill.innerText = role;
        if (data.role === "reseller") rolePill.classList.add("reseller");
      }
    } catch (err) {
      console.error("Gagal sinkron profil:", err.message);
    }
  }

  // Ambil riwayat pesanan
  async function loadOrderHistory(userId) {
    const tableBody = document.getElementById("orderHistoryBody");
    const emptyState = document.getElementById("historyEmptyState");

    try {
      const { data: orders, error } = await window.supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (orders && orders.length > 0) {
        tableBody.innerHTML = "";
        emptyState.style.display = "none";
        document.getElementById("totalOrdersCount").innerText = orders.length;

        orders.forEach((ord) => {
          const row = document.createElement("tr");
          const date = new Date(ord.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const price = Number(ord.price).toLocaleString("id-ID");

          row.innerHTML = `
            <td><strong style="color: var(--accent-red);">${ord.invoice}</strong></td>
            <td>${ord.game_title}</td>
            <td>${ord.item_name}</td>
            <td>Rp ${price}</td>
            <td><span class="status-badge ${ord.status.toLowerCase()}">${ord.status}</span></td>
            <td>${date}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = "";
        emptyState.style.display = "block";
      }
    } catch (err) {
      console.error("Gagal load pesanan:", err.message);
    }
  }

  // Tombol Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      if (window.supabase) await window.supabase.auth.signOut();
      localStorage.removeItem("mgs_user");
      window.location.href = "/";
    }
  });

  // Tombol Isi Saldo
  document.getElementById("btnDeposit").addEventListener("click", () => {
    alert("Fitur Deposit Saldo Instan QRIS akan aktif di Step Integrasi Payment Gateway!");
  });
});