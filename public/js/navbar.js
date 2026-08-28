document.addEventListener("DOMContentLoaded", () => {
  const navActions = document.querySelector(".nav-actions");
  const storedUser = localStorage.getItem("mgs_user");

  if (navActions && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";

      // Ganti tombol Masuk & Daftar menjadi tombol Dashboard & Logout
      navActions.innerHTML = `
        <div class="nav-user-logged">
          <a href="/dashboard.html" class="btn-nav-dashboard">
            <i class="fa-solid fa-user-gear"></i> ${displayName}
          </a>
          <button class="btn-nav-logout-mini" id="navLogoutBtn" title="Keluar Akun">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;

      // Event Logout langsung dari Navbar
      document.getElementById("navLogoutBtn").addEventListener("click", async () => {
        if (confirm("Apakah Anda yakin ingin keluar?")) {
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