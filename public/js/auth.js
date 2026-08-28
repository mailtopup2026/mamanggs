document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Handler Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const pass = document.getElementById("loginPassword").value;

      // Simulasi autentikasi sebelum kunci API Supabase dimasukkan
      alert(`Login Berhasil!\nSelamat datang kembali, ${email}`);
      window.location.href = "/";
    });
  }

  // Handler Register
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value;
      const wa = document.getElementById("regWhatsapp").value;
      const email = document.getElementById("regEmail").value;

      alert(`Pendaftaran Berhasil!\nAkun atas nama ${name} (${wa}) telah aktif sebagai Member MamangGS.`);
      window.location.href = "/auth/login.html";
    });
  }
});