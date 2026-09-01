document.addEventListener("DOMContentLoaded", async () => {
  const storedUser = localStorage.getItem("mgs_user");
  let user = storedUser ? JSON.parse(storedUser) : null;

  // Kamus Badge Game
  const gameDictionary = {
    MLBB: { name: "Mobile Legends", icon: "fa-solid fa-shield-halved" },
    PUBG: { name: "PUBG Mobile", icon: "fa-solid fa-crosshairs" },
    FF: { name: "Free Fire", icon: "fa-solid fa-fire" },
    VALO: { name: "Valorant", icon: "fa-solid fa-skull" },
    DOTA: { name: "Dota 2", icon: "fa-solid fa-khanda" },
    GENSHIN: { name: "Genshin Impact", icon: "fa-solid fa-wind" },
    HOK: { name: "Honor of Kings", icon: "fa-solid fa-crown" },
    ROBLOX: { name: "Roblox", icon: "fa-solid fa-cubes" },
    WOS: { name: "Whiteout Survival", icon: "fa-solid fa-snowflake" }
  };

  const checkSupabase = setInterval(async () => {
    if (window.supabase) {
      clearInterval(checkSupabase);

      try {
        const { data: sessionData } = await window.supabase.auth.getSession();
        if (sessionData?.session?.user) {
          user = sessionData.session.user;
          localStorage.setItem("mgs_user", JSON.stringify(user));
        }
      } catch (e) {}

      if (!user) {
        window.location.href = "/auth/login.html";
        return;
      }

      const initialName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
      if (document.getElementById("profileName")) document.getElementById("profileName").innerText = initialName;
      if (document.getElementById("profileEmail")) document.getElementById("profileEmail").innerText = user.email || "";

      loadUserProfile(user.id);
    }
  }, 100);

  async function loadUserProfile(userId) {
    try {
      const { data: profile, error } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      let userPhone = null;

      if (profile) {
        userPhone = profile.whatsapp || null;
        if (profile.full_name && document.getElementById("profileName")) {
          document.getElementById("profileName").innerText = profile.full_name;
        }
        if (profile.email && document.getElementById("profileEmail")) {
          document.getElementById("profileEmail").innerText = profile.email;
        }

        // Avatar
        const userAvatarImg = document.getElementById("userAvatarImg");
        if (userAvatarImg) {
          const avatarUrl = profile.avatar_url && profile.avatar_url.trim() !== "" 
            ? profile.avatar_url 
            : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.full_name || "Member")}&radius=50`;
          userAvatarImg.src = avatarUrl;
        }

        // Render Badge Game
        const dashboardBadges = document.getElementById("dashboardBadges");
        if (dashboardBadges) {
          const favGames = Array.isArray(profile.favorite_games) ? profile.favorite_games : [];
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

        // Saldo
        const walletEl = document.getElementById("walletBalance");
        if (walletEl) {
          const balance = Number(profile.balance || 0).toLocaleString("id-ID");
          walletEl.innerText = `Rp ${balance}`;
        }

        // Role
        const rolePill = document.getElementById("profileRole");
        if (rolePill) {
          rolePill.innerText = (profile.role || "MEMBER").toUpperCase();
        }
      }

      loadOrderHistory(userId, userPhone);
    } catch (err) {
      console.error("Gagal sinkron profil:", err.message);
      loadOrderHistory(userId, null);
    }
  }

  async function loadOrderHistory(userId, userPhone) {
    const tableBody = document.getElementById("orderHistoryBody");
    const emptyState = document.getElementById("historyEmptyState");
    const countEl = document.getElementById("totalOrdersCount");

    try {
      let query = window.supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (userPhone && userId) {
        query = query.or(`user_id.eq.${userId},whatsapp.eq.${userPhone}`);
      } else if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const totalCount = orders ? orders.length : 0;
      if (countEl) countEl.innerText = totalCount;

      if (orders && orders.length > 0) {
        if (tableBody) tableBody.innerHTML = "";
        if (emptyState) emptyState.style.display = "none";

        orders.forEach((ord) => {
          const row = document.createElement("tr");
          const date = new Date(ord.created_at || Date.now()).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const price = Number(ord.price || 0).toLocaleString("id-ID");
          const isSuccess = (ord.status || "").toUpperCase() === "SUCCESS";
          const statusClass = isSuccess ? "success" : "pending";

          row.innerHTML = `
            <td><span class="invoice-text">${ord.invoice}</span></td>
            <td>${ord.game_title || ord.game_code || "-"}</td>
            <td>${ord.item_name}</td>
            <td style="color: #38bdf8; font-weight: 700;">Rp ${price}</td>
            <td><span class="status-badge ${statusClass}">${ord.status}</span></td>
            <td style="color: #94a3b8; font-size: 0.82rem;">${date}</td>
          `;
          if (tableBody) tableBody.appendChild(row);
        });
      } else {
        if (tableBody) tableBody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
      }
    } catch (err) {
      console.error("Gagal load pesanan:", err.message);
    }
  }

  const handleLogout = async () => {
    try {
      if (window.supabase?.auth) await window.supabase.auth.signOut();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document.getElementById("btnMobileLogout")?.addEventListener("click", handleLogout);

  document.getElementById("btnDeposit")?.addEventListener("click", () => {
    alert("Fitur Deposit Saldo Instan QRIS akan aktif di menu saldo.");
  });
});