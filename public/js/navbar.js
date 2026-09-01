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

  // Jika modal belum ada di DOM dokumen, buat secara dinamis
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

    // Tutup modal via tombol Batal
    document.getElementById("btnCancelLogout")?.addEventListener("click", () => {
      modal.classList.remove("show");
    });

    // Tutup jika area luar modal diklik
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    // Eksekusi logout saat tombol konfirmasi diklik
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
        // Bersihkan semua local storage & cache session
        localStorage.removeItem("mgs_user");
        localStorage.clear();
        sessionStorage.clear();

        // Arahkan ke beranda
        window.location.href = "/";
      }
    });
  }

  // Tampilkan Cyber Modal
  modal.classList.add("show");
}

document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  // 1. EVENT LISTENER UNTUK MOBILE TOGGLE
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

  // 2. RENDER NAVBAR
  function renderAuthNav(userData, profileData) {
    const desktopNav = document.getElementById("desktopNavActions") || document.querySelector(".nav-actions");
    const mobileAuthSlot = document.getElementById("mobileAuthSlot");

    const blogLink = `<a href="/blog.html" class="btn-nav-login" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"><i class="fa-solid fa-newspaper"></i> Blog</a>`;
    const leaderLink = `<a href="/leaderboard.html" class="btn-nav-login" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #f59e0b;"><i class="fa-solid fa-crown"></i> Leaderboard</a>`;

    const isAdmin = profileData?.role === "admin";
    const adminLink = isAdmin
      ? `<a href="/admin.html" class="btn-nav-login" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1);"><i class="fa-solid fa-shield-halved"></i> Admin Secret</a>`
      : "";

    // JIKA USER BELUM LOGIN
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

    // JIKA USER SUDAH LOGIN
    const name = profileData?.full_name || userData.user_metadata?.full_name || userData.email?.split("@")[0] || "Member";
    const avatarUrl = (profileData && profileData.avatar_url && profileData.avatar_url.trim() !== "")
      ? profileData.avatar_url
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&radius=50`;

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
          <button id="navLogoutBtn" onclick="handleLogout()" title="Keluar Akun" style="background: transparent; border: none; color: var(--text-muted, #94a3b8); cursor: pointer; padding: 4px 8px; font-size: 0.95rem; border-left: 1px solid rgba(255, 255, 255, 0.1); transition: color 0.2s ease;">
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
        <button id="btnMobileLogout" onclick="handleLogout()" class="mobile-menu-link" style="width: 100%; background: none; border: none; text-align: left; cursor: pointer; color: #ef4444;">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
        </button>
      `;
    }
  }

  // 3. SINKRONISASI SESSION SUPABASE
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