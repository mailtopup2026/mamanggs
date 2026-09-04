// ==========================================
// FUNGSI GLOBAL LOGOUT DENGAN CYBER MODAL
// ==========================================
function handleLogout() {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  let modal = document.getElementById("logoutModalOverlay");

  if (!modal) {
    const modalHTML = `
      <div class="mgs-modal-overlay" id="logoutModalOverlay">
        <div class="mgs-cyber-modal">
          <div class="modal-icon-glow">
            <i class="fa-solid fa-power-off"></i>
          </div>
          <h3>Konfirmasi Keluar</h3>
          <p>Apakah kamu yakin ingin mengakhiri sesi dan keluar dari akun MamangGS?</p>
          <div class="modal-actions-grid">
            <button type="button" class="btn-modal-cancel" id="btnCancelLogout">Batal</button>
            <button type="button" class="btn-modal-confirm" id="btnConfirmLogout">Ya, Keluar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modal = document.getElementById("logoutModalOverlay");

    document.getElementById("btnCancelLogout")?.addEventListener("click", () => {
      modal.classList.remove("show");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    document.getElementById("btnConfirmLogout")?.addEventListener("click", async () => {
      const btn = document.getElementById("btnConfirmLogout");
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Keluar...';

      try {
        const client = getClient();
        if (client && client.auth) {
          await client.auth.signOut();
        }
      } catch (err) {
        console.warn("Error saat sign out Supabase:", err);
      } finally {
        localStorage.removeItem("mgs_user");
        sessionStorage.clear();
        window.location.href = "/";
      }
    });
  }

  modal.classList.add("show");
}

document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  // 1. EVENT LISTENER UNTUK MOBILE TOGGLE & SINKRONISASI PENCARIAN
  const btnMobileSearch = document.getElementById("btnMobileSearchToggle");
  const mobileSearchBar = document.getElementById("mobileSearchBar");
  const mobileSearchInput = document.getElementById("mobileSearchInput");

  if (btnMobileSearch && mobileSearchBar) {
    btnMobileSearch.addEventListener("click", () => {
      const isVisible = mobileSearchBar.style.display === "block";
      mobileSearchBar.style.display = isVisible ? "none" : "block";
      if (!isVisible && mobileSearchInput) {
        setTimeout(() => mobileSearchInput.focus(), 80);
      }
    });
  }

  if (mobileSearchInput) {
    const forwardSearchValue = () => {
      const query = mobileSearchInput.value;
      const desktopSearch = document.getElementById("searchInput") || document.getElementById("gameSearchInput");
      if (desktopSearch) {
        desktopSearch.value = query;
        desktopSearch.dispatchEvent(new Event("input", { bubbles: true }));
        desktopSearch.dispatchEvent(new Event("keyup", { bubbles: true }));
        desktopSearch.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const gameCards = document.querySelectorAll(".catalog-poster-card, .popular-compact-card, .game-card-item");
      if (gameCards.length > 0) {
        const cleanQuery = query.toLowerCase().trim();
        gameCards.forEach(card => {
          const title = (card.innerText || card.textContent || "").toLowerCase();
          if (!cleanQuery || title.includes(cleanQuery)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      }

      if (typeof window.filterGamesCatalog === "function") {
        window.filterGamesCatalog(query);
      }
    };

    mobileSearchInput.addEventListener("input", forwardSearchValue);
    mobileSearchInput.addEventListener("keyup", forwardSearchValue);
    mobileSearchInput.addEventListener("change", forwardSearchValue);
  }

  const btnMobileMenu = document.getElementById("btnMobileMenuToggle");
  const mobileMenuDropdown = document.getElementById("mobileMenuDropdown");
  const btnCloseMobileMenu = document.getElementById("btnCloseMobileMenu");

  if (btnMobileMenu && mobileMenuDropdown) {
    btnMobileMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenuDropdown.classList.toggle("show");
    });
  }

  if (btnCloseMobileMenu && mobileMenuDropdown) {
    btnCloseMobileMenu.addEventListener("click", () => {
      mobileMenuDropdown.classList.remove("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (mobileMenuDropdown && !mobileMenuDropdown.contains(e.target) && e.target !== btnMobileMenu) {
      mobileMenuDropdown.classList.remove("show");
    }
  });

  // 2. RENDER NAVBAR
  function renderAuthNav(userData, profileData) {
    const isMobile = window.innerWidth <= 768;
    
    // Hanya ambil container desktop jika di mode PC (layar lebar)
    let desktopNav = null;
    if (!isMobile) {
      desktopNav = document.getElementById("desktopNavActions") || document.querySelector(".nav-actions:not(.mobile-only)");
    } else {
      // Jika di layar HP, bersihkan container desktop agar tidak bocor melayang
      const floatingContainer = document.getElementById("desktopNavActions");
      if (floatingContainer) floatingContainer.innerHTML = "";
    }

    const mobileAuthSlot = document.getElementById("mobileAuthSlot");

    const fjbLink = `<a href="/market.html" class="btn-nav-login" style="background: rgba(204, 255, 0, 0.1); border-color: rgba(204, 255, 0, 0.3); color: #ccff00;"><i class="fa-solid fa-store"></i> FJB Akun</a>`;
    const blogLink = `<a href="/blog.html" class="btn-nav-login" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"><i class="fa-solid fa-newspaper"></i> Blog</a>`;
    const leaderLink = `<a href="/leaderboard.html" class="btn-nav-login" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #f59e0b;"><i class="fa-solid fa-crown"></i> Leaderboard</a>`;

    const mobileFjbLink = `<a href="/market.html" class="mobile-menu-link" style="color: #ccff00;"><i class="fa-solid fa-store" style="color: #ccff00;"></i> FJB Jual Beli Akun</a>`;

    const isAdmin = profileData?.role === "admin";
    const adminLink = isAdmin
      ? `<a href="/admin.html" class="btn-nav-login" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1);"><i class="fa-solid fa-shield-halved"></i> Admin Secret</a>`
      : "";

    // JIKA USER BELUM LOGIN
    if (!userData) {
      if (desktopNav) {
        desktopNav.innerHTML = `
          ${fjbLink}
          ${blogLink}
          ${leaderLink}
          <a href="/auth/login.html" class="btn-nav-login" id="navLoginBtn"><i class="fa-solid fa-right-to-bracket"></i> Masuk</a>
          <a href="/auth/register.html" class="btn-nav-register" id="navRegisterBtn"><i class="fa-solid fa-user-plus"></i> Daftar</a>
        `;
      }
      if (mobileAuthSlot) {
        mobileAuthSlot.innerHTML = `
          ${mobileFjbLink}
          <a href="/auth/login.html" class="mobile-menu-link"><i class="fa-solid fa-right-to-bracket"></i> Masuk Akun</a>
          <a href="/auth/register.html" class="mobile-menu-link" style="color: #f59e0b;"><i class="fa-solid fa-user-plus"></i> Daftar Member</a>
        `;
      }
      return;
    }

    // JIKA USER SUDAH LOGIN
    const name = profileData?.full_name || profileData?.username || userData.user_metadata?.full_name || userData.email?.split("@")[0] || "Member";
    const avatarUrl = (profileData && profileData.avatar_url && profileData.avatar_url.trim() !== "")
      ? profileData.avatar_url
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&radius=50`;

    if (desktopNav) {
      desktopNav.innerHTML = `
        ${adminLink}
        ${fjbLink}
        ${blogLink}
        ${leaderLink}
        <div class="user-nav-capsule" style="display: inline-flex; align-items: center; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; padding: 4px 6px 4px 5px; gap: 8px; backdrop-filter: blur(8px);">
          <a href="/dashboard.html" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #fff;">
            <img src="${avatarUrl}" alt="${name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isAdmin ? '#ef4444' : '#ccff00'}; background: #1e293b;">
            <span style="font-weight: 800; font-size: 0.85rem; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ffffff;">${name}</span>
          </a>
          <button id="navLogoutBtn" onclick="handleLogout()" title="Keluar Akun" style="background: transparent; border: none; color: var(--text-muted, #94a3b8); cursor: pointer; padding: 4px 8px; font-size: 0.95rem; border-left: 1px solid rgba(255, 255, 255, 0.1); transition: color 0.2s ease;">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      `;
    }

    if (mobileAuthSlot) {
      mobileAuthSlot.innerHTML = `
        <div style="padding: 10px; font-size: 0.88rem; color: #ccff00; font-weight: 800; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 6px;">
          <img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 8px; object-fit: cover; border: 1.5px solid ${isAdmin ? '#ef4444' : '#ccff00'};">
          <span>${name}</span>
        </div>
        ${mobileFjbLink}
        ${isAdmin ? `
          <a href="/admin.html" class="mobile-menu-link" style="color: #ef4444;">
            <i class="fa-solid fa-shield-halved"></i> Admin Panel
          </a>
        ` : ""}
        <a href="/dashboard.html" class="mobile-menu-link">
          <i class="fa-solid fa-wallet"></i> Saldo & Akun
        </a>
        <button id="btnMobileLogout" onclick="handleLogout()" class="mobile-menu-link" style="width: 100%; background: none; border: none; text-align: left; cursor: pointer; color: #ef4444;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
        </button>
      `;
    }
  }

  // 3. SINKRONISASI SESSION SUPABASE (AMAN DARI AUTO-LOGOUT)
  const storedUser = localStorage.getItem("mgs_user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    user = null;
  }

  if (user) {
    renderAuthNav(user, null);
  } else {
    renderAuthNav(null, null);
  }

  const client = getClient();
  if (client && client.auth) {
    try {
      const { data: { user: currentUser } } = await client.auth.getUser();

      if (currentUser) {
        user = currentUser;
        localStorage.setItem("mgs_user", JSON.stringify(user));

        const { data: profile } = await client
          .from("profiles")
          .select("full_name, username, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle();

        renderAuthNav(user, profile);
      } else if (!storedUser) {
        renderAuthNav(null, null);
      }
    } catch (e) {
      console.warn("Navbar sync warning:", e);
      if (user) renderAuthNav(user, null);
    }
  }
});

// ==========================================
// FUNGSI GLOBAL CYBER TOAST NOTIFICATION
// ==========================================
window.showToast = function (message, type = "warning") {
  let container = document.getElementById("mgsToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "mgsToastContainer";
    container.className = "mgs-toast-container";
    document.body.appendChild(container);
  }

  const iconMap = {
    warning: "fa-triangle-exclamation",
    error: "fa-circle-xmark",
    success: "fa-circle-check"
  };

  const toast = document.createElement("div");
  toast.className = `mgs-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || iconMap.warning}"></i>
    <div class="mgs-toast-msg">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};