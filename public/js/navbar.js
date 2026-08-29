document.addEventListener("DOMContentLoaded", () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const storedUser = localStorage.getItem("mgs_user");
  let user = storedUser ? JSON.parse(storedUser) : null;

  function renderNavbarUser(userData, profileData) {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    const blogLink = `<a href="/blog.html" class="btn-nav-login" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);"><i class="fa-solid fa-newspaper"></i> Blog</a>`;
    const leaderLink = `<a href="/leaderboard.html" class="btn-nav-login" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-crown"></i> Leaderboard</a>`;
    
    // Tombol Admin Khusus (Hanya muncul jika role = admin)
    const isAdmin = profileData?.role === 'admin';
    const adminSecretLink = isAdmin ? `
      <a href="/admin.html" class="btn-nav-login" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1);">
        <i class="fa-solid fa-shield-halved"></i> Admin Secret
      </a>
    ` : '';

    if (!userData) {
      navActions.innerHTML = `
        ${blogLink}
        ${leaderLink}
        <a href="/auth/login.html" class="btn-nav-login" id="navLoginBtn"><i class="fa-solid fa-right-to-bracket"></i> Masuk</a>
        <a href="/auth/register.html" class="btn-nav-register" id="navRegisterBtn"><i class="fa-solid fa-user-plus"></i> Daftar</a>
      `;
      return;
    }

    const name = profileData?.full_name || userData.user_metadata?.full_name || userData.email?.split("@")[0] || "Member";
    const avatarUrl = profileData?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&radius=50`;

    navActions.innerHTML = `
      ${adminSecretLink}
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

    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        if (confirm("Yakin ingin keluar akun?")) {
          const client = getClient();
          if (client) await client.auth.signOut();
          localStorage.removeItem("mgs_user");
          window.location.href = "/";
        }
      });
      logoutBtn.addEventListener("mouseenter", () => logoutBtn.style.color = "#ef4444");
      logoutBtn.addEventListener("mouseleave", () => logoutBtn.style.color = "#94a3b8");
    }
  }

  if (user) {
    renderNavbarUser(user, null);
  } else {
    renderNavbarUser(null, null);
  }

  async function syncNavbarProfile() {
    const client = getClient();
    if (!client) {
      setTimeout(syncNavbarProfile, 200);
      return;
    }

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        if (user) {
          localStorage.removeItem("mgs_user");
          renderNavbarUser(null, null);
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

      renderNavbarUser(user, profile);
    } catch (e) {
      console.warn("Navbar sync issue:", e);
    }
  }

  syncNavbarProfile();
});