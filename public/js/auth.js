// Toggle Show/Hide Password
function togglePass(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    iconElement.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    input.type = "password";
    iconElement.classList.replace("fa-eye", "fa-eye-slash");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const forgotForm = document.getElementById("forgotForm");

  // Handler Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      alert(`Login Berhasil!\nSelamat datang kembali, ${email}`);
      window.location.href = "/";
    });
  }

  // Handler Register
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value;
      const email = document.getElementById("regEmail").value;
      alert(`Pendaftaran Berhasil!\nAkun atas nama ${name} (${email}) telah aktif.`);
      window.location.href = "/auth/login.html";
    });
  }

  // Handler Forgot Password
  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("forgotEmail").value;
      alert(`Kode verifikasi 5-digit telah dikirimkan ke email: ${email}`);
    });
  }
});