// ==========================================
// FUNGSI TOAST KUSTOM MAMANGGS
// ==========================================
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

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==========================================
// TOGGLE SHOW/HIDE PASSWORD + REAKSI MASKOT
// ==========================================
function togglePass(inputId, iconElement) {
  const input = document.getElementById(inputId);
  const mascot = document.getElementById("mascotAvatar");
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    if (iconElement) iconElement.classList.replace("fa-eye-slash", "fa-eye");
    
    // Maskot ngintip satu mata
    if (mascot) {
      mascot.classList.remove("blindfold");
      mascot.classList.add("peeking");
    }
  } else {
    input.type = "password";
    if (iconElement) iconElement.classList.replace("fa-eye", "fa-eye-slash");
    
    // Maskot tutup mata lagi jika kolom password masih aktif
    if (mascot && document.activeElement === input) {
      mascot.classList.remove("peeking");
      mascot.classList.add("blindfold");
    }
  }
}

// Trigger Maskot Sukses / Horay
function triggerMascotSuccess() {
  const mascot = document.getElementById("mascotAvatar");
  if (mascot) {
    mascot.className = "mascot-avatar success";
  }
}

// ==========================================
// LOGIN DENGAN GOOGLE OAUTH
// ==========================================
async function loginWithGoogle() {
  if (!window.supabase || !window.supabase.auth) {
    showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
    return;
  }

  try {
    const { error } = await window.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  } catch (err) {
    showToast("error", "Gagal Login Google", err.message);
  }
}

// ==========================================
// LOGIN DENGAN DISCORD OAUTH
// ==========================================
async function loginWithDiscord() {
  if (!window.supabase || !window.supabase.auth) {
    showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
    return;
  }

  try {
    const { error } = await window.supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  } catch (err) {
    showToast("error", "Gagal Login Discord", err.message);
  }
}

// ==========================================
// INITIALIZE INTERACTIVE MASCOT EVENTS
// ==========================================
function initMascotEvents() {
  const mascot = document.getElementById("mascotAvatar");
  if (!mascot) return;

  // Cari semua input password di form
  const passInputs = document.querySelectorAll('input[type="password"]');
  const otherInputs = document.querySelectorAll('input:not([type="password"])');

  passInputs.forEach(input => {
    input.addEventListener("focus", () => {
      if (input.type === "password") {
        mascot.classList.remove("peeking");
        mascot.classList.add("blindfold");
      }
    });

    input.addEventListener("blur", () => {
      mascot.classList.remove("blindfold", "peeking");
    });
  });

  otherInputs.forEach(input => {
    input.addEventListener("focus", () => {
      mascot.classList.remove("blindfold", "peeking");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi event maskot
  initMascotEvents();

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const forgotForm = document.getElementById("forgotForm");
  const updatePasswordForm = document.getElementById("updatePasswordForm");

  // ==========================================
  // HANDLER REGISTER (DENGAN CEK EMAIL DUPLIKAT & CAPTCHA)
  // ==========================================
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.supabase || !window.supabase.auth) {
        showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
        return;
      }

      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const password = document.getElementById("regPassword").value;
      const btn = registerForm.querySelector('button[type="submit"]');

      // Ambil token Turnstile jika form register ada widgetnya
      const captchaToken = registerForm.querySelector('[name="cf-turnstile-response"]')?.value;

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendaftarkan...';

      try {
        // LAPIS 1: Cek apakah email sudah ada di tabel profiles
        const { data: existingProfile } = await window.supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile) {
          showToast("error", "Email Sudah Terdaftar", "Email ini sudah digunakan. Silakan langsung masuk ke akun Anda!");
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Register';
          if (window.turnstile) window.turnstile.reset();
          return;
        }

        // LAPIS 2: Lakukan pendaftaran via Supabase Auth
        const signUpOptions = {
          data: { full_name: name },
          emailRedirectTo: "https://mamanggs.vercel.app/auth/login.html"
        };
        if (captchaToken) {
          signUpOptions.captchaToken = captchaToken;
        }

        const { data, error } = await window.supabase.auth.signUp({
          email: email,
          password: password,
          options: signUpOptions
        });

        if (error) throw error;

        // Cek keamanan Supabase: jika user terdaftar sebelumnya, identities array kosong
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          showToast("error", "Email Sudah Terdaftar", "Email ini sudah terdaftar! Silakan langsung login.");
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Register';
          if (window.turnstile) window.turnstile.reset();
          return;
        }

        if (data.user) {
          await window.supabase.from("profiles").upsert([
            {
              id: data.user.id,
              full_name: name,
              email: email,
              role: "member",
              balance: 0
            }
          ]);
        }

        // Maskot Horay!
        triggerMascotSuccess();

        showToast("success", "Pendaftaran Berhasil!", "Silakan login menggunakan akun baru Anda.");
        setTimeout(() => {
          window.location.href = "/auth/login.html";
        }, 1500);
      } catch (err) {
        let errorMsg = err.message;
        if (errorMsg.toLowerCase().includes("already registered") || errorMsg.toLowerCase().includes("user already exists")) {
          errorMsg = "Email ini sudah terdaftar! Silakan langsung login.";
        }
        showToast("error", "Gagal Mendaftar", errorMsg);
        if (window.turnstile) window.turnstile.reset();
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Register';
      }
    });
  }

  // ==========================================
  // HANDLER LOGIN (DENGAN CLOUDFLARE TURNSTILE)
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.supabase || !window.supabase.auth) {
        showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
        return;
      }

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const btn = loginForm.querySelector('button[type="submit"]');

      // Ambil token dari Turnstile Captcha
      const captchaToken = loginForm.querySelector('[name="cf-turnstile-response"]')?.value;

      if (!captchaToken) {
        showToast("error", "Verifikasi Keamanan", "Harap tunggu verifikasi Captcha selesai!");
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

      try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: email,
          password: password,
          options: {
            captchaToken: captchaToken
          }
        });

        if (error) throw error;

        // Simpan sesi user ke localStorage
        localStorage.setItem("mgs_user", JSON.stringify(data.user));

        // Maskot Horay!
        triggerMascotSuccess();

        // Cek Role apakah Admin atau Member
        let redirectTarget = "/";
        try {
          const { data: profile } = await window.supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profile && profile.role === "admin") {
            redirectTarget = "/admin.html";
          }
        } catch (roleErr) {
          console.warn("Gagal cek role, fallback ke home:", roleErr);
        }

        showToast("success", "Login Berhasil!", "Mengalihkan ke dashboard...");
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 1200);
      } catch (err) {
        showToast("error", "Gagal Masuk", err.message);
        // Reset captcha agar siap dicoba kembali
        if (window.turnstile) window.turnstile.reset();
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Sign In';
      }
    });
  }

  // ==========================================
  // HANDLER FORGOT PASSWORD
  // ==========================================
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.supabase || !window.supabase.auth) {
        showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
        return;
      }

      const email = document.getElementById("forgotEmail").value.trim();
      const btn = forgotForm.querySelector('button[type="submit"]');

      // Ambil token Turnstile jika form forgot ada widgetnya
      const captchaToken = forgotForm.querySelector('[name="cf-turnstile-response"]')?.value;

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

      try {
        const resetOptions = {
          redirectTo: "https://mamanggs.vercel.app/auth/reset-password.html"
        };
        if (captchaToken) {
          resetOptions.captchaToken = captchaToken;
        }

        const { error } = await window.supabase.auth.resetPasswordForEmail(email, resetOptions);
        if (error) throw error;
        
        triggerMascotSuccess();
        showToast("success", "Email Terkirim!", "Tautan reset telah dikirim ke " + email);
      } catch (err) {
        let msg = err.message;
        if (msg.includes("rate limit")) {
          msg = "Terlalu sering meminta email. Silakan tunggu 1-2 menit sebelum mencoba lagi.";
        }
        showToast("error", "Permintaan Gagal", msg);
        if (window.turnstile) window.turnstile.reset();
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Send Code';
      }
    });
  }

  // ==========================================
  // HANDLER UPDATE PASSWORD BARU
  // ==========================================
  if (updatePasswordForm) {
    updatePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.supabase || !window.supabase.auth) {
        showToast("error", "Koneksi Belum Siap", "Silakan refresh halaman terlebih dahulu.");
        return;
      }

      const newPassword = document.getElementById("newPassword").value;
      const btn = updatePasswordForm.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memperbarui...';

      try {
        const { error } = await window.supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        triggerMascotSuccess();
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