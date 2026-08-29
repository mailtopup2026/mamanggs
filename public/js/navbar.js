document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const isHome = window.location.pathname === "/" || window.location.pathname === "/index.html";

  // 1. INJEKSI NAVBAR STANDAR
  const header = document.querySelector("header.navbar");
  if (header) {
    header.innerHTML = `
      <div class="navbar-container" style="position: relative;">
        <a href="/" class="brand-logo">
          <span class="logo-badge"><i class="fa-solid fa-gamepad"></i></span>
          Mamang<span>GS</span>
        </a>

        <!-- Search Desktop (Khusus Home) -->
        <div class="nav-search desktop-only" style="${isHome ? '' : 'display: none !important;'}">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Cari Game (MLBB, Free Fire, Genshin...)" id="searchInput">
        </div>

        <!-- Desktop Action Buttons -->
        <div class="nav-actions desktop-only" id="desktopNavActions">
          <a href="/blog.html" class="btn-nav-login" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"><i class="fa-solid fa-newspaper"></i> Blog</a>
          <a href="/leaderboard.html" class="btn-nav-login" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #f59e0b;"><i class="fa-solid fa-crown"></i> Leaderboard</a>
          <a href="/auth/login.html" class="btn-nav-login" id="navLoginBtn"><i class="fa-solid fa-right-to-bracket"></i> Masuk</a>
          <a href="/auth/register.html" class="btn-nav-register" id="navRegisterBtn"><i class="fa-solid fa-user-plus"></i> Daftar</a>
        </div>

        <!-- Mobile Controls (Titik Tiga & Search) -->
        <div class="mobile-nav-toggle-group">
          ${isHome ? `
            <button id="btnMobileSearchToggle" class="btn-mobile-icon" title="Cari Game">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          ` : ''}
          <button id="btnMobileMenuToggle" class="btn-mobile-icon" title="Menu Lengkap">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Search Field -->
      ${isHome ? `
        <div id="mobileSearchBar" class="mobile-search-dropdown" style="display: none;">
          <input type="text" placeholder="Ketik nama game..." id="mobileSearchInput">
        </div>
      ` : ''}

      <!-- Mobile Dropdown Drawer -->
      <div id="mobileMenuDropdown" class="mobile-menu-drawer">
        <div class="mobile-menu-header">
          <span style="font-weight: 800; font-size: 0.88rem; color: #fff;">Menu MamangGS</span>
          <button id="btnCloseMobileMenu" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer;">✕</button>
        </div>
        <div class="mobile-menu-items">
          <a href="/" class="mobile-menu-link"><i class="fa-solid fa-house" style="color: #3b82f6;"></i> Beranda</a>
          <a href="/leaderboard.html" class="mobile-menu-link"><i class="fa-solid fa-crown" style="color: #f59e0b;"></i> Leaderboard Sultan</a>
          <a href="/blog.html" class="mobile-menu-link"><i class="fa-solid fa-newspaper" style="color: #38bdf8;"></i> Blog & Tips Game</a>
          <a href="/order-status.html" class="mobile-menu-link"><i class="fa-solid fa-receipt" style="color: #10b981;"></i> Lacak Pesanan</a>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0;">
          <div id="mobileAuthSlot">
            <a href="/auth/login.html" class="mobile-menu-link"><i class="fa-solid fa-right-to-bracket"></i> Masuk Akun</a>
            <a href="/auth/register.html" class="mobile-menu-link" style="color: #f59e0b;"><i class="fa-solid fa-user-plus"></i> Daftar Member</a>
          </div>
        </div>
      </div>
    `;
  }

  // 2. EVENT LISTENER TOGGLE
  const btnMobileSearch = document.getElementById("btnMobileSearchToggle");
  const mobileSearchBar = document.getElementById("mobileSearchBar");
  const mobileSearchInput = document.getElementById("mobileSearchInput");

  if (btnMobileSearch && mobileSearchBar) {
    btnMobileSearch.addEventListener("click", () => {
      const isVisible = mobileSearchBar.style.display === "block";
      mobileSearchBar.style.display = isVisible ? "none" : "block";
      if (!isVisible && mobileSearchInput) mobileSearchInput.focus();
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", () => {
      const desktopSearch = document.getElementById("searchInput");
      if (desktopSearch) {
        desktopSearch.value = mobileSearchInput.value;
        desktopSearch.dispatchEvent(new Event("input"));
      }
    });
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

  // 3. RENDER AUTH STATUS
  function renderAuthNav(userData, profileData) {
    const desktopNav = document.getElementById("desktopNavActions");
    const mobileAuthSlot = document.getElementById("mobileAuthSlot");

    const blogLink = `<a href="/blog.html" class="btn-nav-login" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"><i class="fa-solid fa-newspaper"></i> Blog</a>`;
    const leaderLink = `<a href="/leaderboard.html" class="btn-nav-login" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #f59e0b;"><i class="fa-solid fa-crown"></i> Leaderboard</a>`;

    const isAdmin = profileData?.role === "admin";
    const adminLink = isAdmin
      ? `<a href="/admin.html" class="btn-nav-login" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1);"><i class="fa-solid fa-shield-halved"></i> Admin Secret</a>`
      : "";

    if (!userData) {
      if (desktopNav) {
        desktopNav.innerHTML = `
          ${blogLink}
          ${leaderLink}
          <a href="/auth/login.html" class="btn-nav-login" id="navLoginBtn"><i class="fa-solid fa-right-to-bracket"></i> Masuk</a>
          <a href="/auth/register.html" class="btn-nav-register" id="navRegisterBtn"><i class="fa-solid fa-user-plus"></i> Daftar</a>
        `;
      }
      if (mobileAuthSlot) {
        mobileAuthSlot.innerHTML = `
          <a href="/auth/login.html" class="mobile-menu-link"><i class="fa-solid fa-right-to-bracket"></i> Masuk Akun</a>
          <a href="/auth/register.html" class="mobile-menu-link" style="color: #f59e0b;"><i class="fa-solid fa-user-plus"></i> Daftar Member</a>
        `;
      }
      return;
    }

    const name = profileData?.full_name || userData.user_metadata?.full_name || userData.email?.split("@")[0] || "Member";
    const avatarUrl = profileData?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&radius=50`;

    if (desktopNav) {
      desktopNav.innerHTML = `
        ${adminLink}
        ${blogLink}
        ${leaderLink}
        <div class="user-nav-capsule" style="display: inline-flex; align-items: center; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; padding: 4px 6px 4px 5px; gap: 8px; backdrop-filter: blur(8px);">
          <a href="/dashboard.html" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #fff;">
            <img src="${avatarUrl}" alt="${name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isAdmin ? '#ef4444' : '#f59e0b'}; background: #1e293b;">
            <span style="font-weight: 800; font-size: 0.85rem; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ffffff;">${name}</span>
          </a>
          <button id="navLogoutBtn" title="Keluar Akun" style="background: transparent; border: none; color: var(--text-muted, #94a3b8); cursor: pointer; padding: 4px 8px; font-size: 0.95rem; border-left: 1px solid rgba(255, 255, 255, 0.1); transition: color 0.2s ease;">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      `;
    }

    if (mobileAuthSlot) {
      mobileAuthSlot.innerHTML = `
        <div style="padding: 6px 10px; font-size: 0.82rem; color: #fbbf24; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <img src="${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%;"> ${name}
        </div>
        ${isAdmin ? `
          <a href="/admin.html" class="mobile-menu-link" style="color: #ef4444;">
            <i class="fa-solid fa-shield-halved"></i> Admin Panel
          </a>
        ` : ""}
        <a href="/dashboard.html" class="mobile-menu-link">
          <i class="fa-solid fa-wallet"></i> Saldo & Akun
        </a>
        <button id="btnMobileLogout" class="mobile-menu-link" style="width: 100%; background: none; border: none; text-align: left; cursor: pointer; color: #ef4444;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
        </button>
      `;
    }

    document.getElementById("navLogoutBtn")?.addEventListener("click", async () => {
      if (confirm("Yakin ingin keluar akun?")) {
        const client = getClient();
        if (client) await client.auth.signOut();
        localStorage.removeItem("mgs_user");
        window.location.href = "/";
      }
    });

    document.getElementById("btnMobileLogout")?.addEventListener("click", async () => {
      if (confirm("Yakin ingin keluar akun?")) {
        const client = getClient();
        if (client) await client.auth.signOut();
        localStorage.removeItem("mgs_user");
        window.location.href = "/";
      }
    });
  }

  // 4. SINKRONISASI SESSION SUPABASE
  const storedUser = localStorage.getItem("mgs_user");
  let user = storedUser ? JSON.parse(storedUser) : null;
  renderAuthNav(user, null);

  const client = getClient();
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        if (user) {
          localStorage.removeItem("mgs_user");
          renderAuthNav(null, null);
        }
        return;
      }
      user = session.user;
      localStorage.setItem("mgs_user", JSON.stringify(user));

      const { data: profile } = await client
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      renderAuthNav(user, profile);
    } catch (e) {
      console.warn("Navbar sync issue:", e);
    }
  }
});