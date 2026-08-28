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

  // Handler Register (Daftar Akun ke Supabase)
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
            data: { full_name: name }
          }
        });

        if (error) throw error;

        // Simpan ke tabel public.profiles
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

        alert("Pendaftaran Berhasil! Silakan masuk dengan akun Anda.");
        window.location.href = "/auth/login.html";
      } catch (err) {
        alert("Gagal mendaftar: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Register';
      }
    });
  }

  // Handler Login (Masuk dengan Supabase)
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
        alert("Login Berhasil! Selamat datang kembali.");
        window.location.href = "/";
      } catch (err) {
        alert("Gagal masuk: " + err.message);
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
        const { error } = await window.supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        alert("Instruksi reset kata sandi telah dikirimkan ke email Anda.");
      } catch (err) {
        alert("Gagal mengirim email reset: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Send Code';
      }
    });
  }
});