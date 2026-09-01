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
  if (document.getElementById("profileName")) document.getElementById("profileName").innerText = initialName;
  if (document.getElementById("profileEmail")) document.getElementById("profileEmail").innerText = user.email || "";

  // Sinkronisasi data real-time dengan Supabase
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      loadUserProfile(user.id);
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

      let userPhone = null;

      if (data) {
        userPhone = data.whatsapp || null;
        if (data.full_name && document.getElementById("profileName")) {
          document.getElementById("profileName").innerText = data.full_name;
        }
        if (data.email && document.getElementById("profileEmail")) {
          document.getElementById("profileEmail").innerText = data.email;
        }

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
        const walletEl = document.getElementById("walletBalance");
        if (walletEl) {
          const balance = Number(data.balance || 0).toLocaleString("id-ID");
          walletEl.innerText = `Rp ${balance}`;
        }

        const rolePill = document.getElementById("profileRole");
        if (rolePill) {
          const role = (data.role || "MEMBER").toUpperCase();
          rolePill.innerText = role;
          if (data.role === "reseller") rolePill.classList.add("reseller");
        }
      }

      // Panggil loadOrderHistory setelah data profile (termasuk nomor WA) siap
      loadOrderHistory(userId, userPhone);

    } catch (err) {
      console.error("Gagal sinkron profil:", err.message);
      loadOrderHistory(userId, null);
    }
  }

  // Ambil riwayat pesanan (Cari via user_id ATAU no WhatsApp)
  async function loadOrderHistory(userId, userPhone) {
    const tableBody = document.getElementById("orderHistoryBody");
    const emptyState = document.getElementById("historyEmptyState");
    const countEl = document.getElementById("totalOrdersCount");

    try {
      let query = window.supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (userPhone) {
        query = query.or(`user_id.eq.${userId},whatsapp.eq.${userPhone}`);
      } else {
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
          const date = new Date(ord.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const price = Number(ord.price || 0).toLocaleString("id-ID");

          row.innerHTML = `
            <td><strong style="color: var(--accent-red);">${ord.invoice}</strong></td>
            <td>${ord.game_title || ord.game_code || "-"}</td>
            <td>${ord.item_name}</td>
            <td>Rp ${price}</td>
            <td><span class="status-badge ${(ord.status || 'pending').toLowerCase()}">${ord.status}</span></td>
            <td>${date}</td>
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

  // ==========================================
  // CUSTOM CYBER MODAL LOGOUT HANDLER
  // ==========================================
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModalOverlay");
  const btnCancelLogout = document.getElementById("btnCancelLogout");
  const btnConfirmLogout = document.getElementById("btnConfirmLogout");

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", () => {
      logoutModal.classList.add("show");
    });

    btnCancelLogout?.addEventListener("click", () => {
      logoutModal.classList.remove("show");
    });

    logoutModal.addEventListener("click", (e) => {
      if (e.target === logoutModal) {
        logoutModal.classList.remove("show");
      }
    });

    btnConfirmLogout?.addEventListener("click", async () => {
      btnConfirmLogout.disabled = true;
      btnConfirmLogout.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Keluar...';

      try {
        if (window.supabase && window.supabase.auth) {
          await window.supabase.auth.signOut();
        }
      } catch (err) {
        console.warn("Gagal sign out Supabase:", err);
      } finally {
        localStorage.removeItem("mgs_user");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    });
  }

  // Tombol Isi Saldo
  document.getElementById("btnDeposit")?.addEventListener("click", () => {
    alert("Fitur Deposit Saldo Instan QRIS akan aktif di Step Integrasi Payment Gateway!");
  });
});