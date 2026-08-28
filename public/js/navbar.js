document.addEventListener("DOMContentLoaded", () => {
  const navActions = document.querySelector(".nav-actions");
  const storedUser = localStorage.getItem("mgs_user");

  if (navActions && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";

      // Render Cyber User Capsule
      navActions.innerHTML = `
        <div class="nav-user-logged">
          <a href="/dashboard.html" class="btn-nav-user-profile" title="Buka Dashboard">
            <div class="nav-mini-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
            <span class="nav-user-name">${displayName}</span>
          </a>
          <button class="btn-nav-logout-capsule" id="navLogoutBtn" title="Keluar Akun">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      `;

      // Event Logout
      document.getElementById("navLogoutBtn").addEventListener("click", async () => {
        if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
          if (window.supabase) await window.supabase.auth.signOut();
          localStorage.removeItem("mgs_user");
          window.location.reload();
        }
      });
    } catch (e) {
      console.error("Gagal parse user session:", e);
    }
  }
});