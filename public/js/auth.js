// Fungsi Toast Kustom MamangGS
function showToast(type, title, message) {
  let container = document.querySelector(".mgs-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "mgs-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `mgs-toast ${type}`;
  
  const iconClass = type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation";

  toast.innerHTML = `
    <div class="mgs-toast-icon">
      <i class="${iconClass}"></i>
    </div>
    <div class="mgs-toast-body">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Animasi masuk
  setTimeout(() => toast.classList.add("show"), 50);

  // Otomatis hilang dalam 4 detik
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

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
  const updatePasswordForm = document.getElementById("updatePasswordForm");

  // Handler Register
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const btn = registerForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendaftarkan...';

      try {
        const { data, error } = await window.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { full_name: name },
            emailRedirectTo: "https://mamanggs.vercel.app/auth/login.html"
          }
        });

        if (error) throw error;

        if (data.user) {
          await window.supabase.from("profiles").insert([
            {
              id: data.user.id,
              full_name: name,
              email: email,
              role: "member",
              balance: 0
            }
          ]);
        }

        showToast("success", "Pendaftaran Berhasil!", "Silakan login menggunakan akun baru Anda.");
        setTimeout(() => {
          window.location.href = "/auth/login.html";
        }, 1500);
      } catch (err) {
        showToast("error", "Gagal Mendaftar", err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Register';
      }
    });
  }

  // Handler Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const btn = loginForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

      try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;

        localStorage.setItem("mgs_user", JSON.stringify(data.user));
        showToast("success", "Login Berhasil!", "Selamat datang kembali di MamangGS.");
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } catch (err) {
        showToast("error", "Gagal Masuk", err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Sign In';
      }
    });
  }

  // Handler Forgot Password
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgotEmail").value.trim();
      const btn = forgotForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

      try {
        const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://mamanggs.vercel.app/auth/reset-password.html"
        });
        if (error) throw error;
        showToast("success", "Email Terkirim!", "Tautan reset telah dikirim ke " + email);
      } catch (err) {
        let msg = err.message;
        if (msg.includes("rate limit")) {
          msg = "Terlalu sering meminta email. Silakan tunggu 1-2 menit sebelum mencoba lagi.";
        }
        showToast("error", "Permintaan Gagal", msg);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Send Code';
      }
    });
  }

  // Handler Update Password Baru
  if (updatePasswordForm) {
    updatePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;
      const btn = updatePasswordForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memperbarui...';

      try {
        const { error } = await window.supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        showToast("success", "Berhasil Diperbarui!", "Kata sandi telah diganti. Mengalihkan ke login...");
        setTimeout(() => {
          window.location.href = "/auth/login.html";
        }, 1500);
      } catch (err) {
        showToast("error", "Gagal Update", err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Update Password';
      }
    });
  }
});