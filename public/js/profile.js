document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // HELPER TOAST NOTIFIKASI MODERN MAMANGGS
  // ==========================================
  function showToast(type, title, message) {
    let container = document.querySelector(".mgs-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "mgs-toast-container";
      document.body.appendChild(container);

      // Inject styling toast jika belum termuat dari global CSS
      if (!document.getElementById("mgs-toast-style")) {
        const style = document.createElement("style");
        style.id = "mgs-toast-style";
        style.textContent = `
          .mgs-toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 90vw;
            pointer-events: none;
          }
          .mgs-toast {
            pointer-events: auto;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            border-radius: 14px;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
            color: #fff;
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .mgs-toast.show {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          .mgs-toast.success {
            border-color: rgba(204, 255, 0, 0.4);
            box-shadow: 0 8px 24px rgba(204, 255, 0, 0.15);
          }
          .mgs-toast.success .mgs-toast-icon {
            color: #ccff00;
          }
          .mgs-toast.error {
            border-color: rgba(239, 68, 68, 0.4);
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
          }
          .mgs-toast.error .mgs-toast-icon {
            color: #ef4444;
          }
          .mgs-toast-icon {
            font-size: 1.3rem;
            flex-shrink: 0;
          }
          .mgs-toast-body h5 {
            margin: 0 0 2px;
            font-size: 0.88rem;
            font-weight: 800;
          }
          .mgs-toast-body p {
            margin: 0;
            font-size: 0.78rem;
            color: #94a3b8;
            line-height: 1.35;
          }
          @media (max-width: 600px) {
            .mgs-toast-container {
              top: 14px;
              left: 14px;
              right: 14px;
              max-width: none;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }

    const toast = document.createElement("div");
    toast.className = `mgs-toast ${type}`;
    const iconClass = type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation";

    toast.innerHTML = `
      <div class="mgs-toast-icon"><i class="${iconClass}"></i></div>
      <div class="mgs-toast-body">
        <h5>${title}</h5>
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  // Daftar Game & Ikon
  const availableGames = [
    { code: "MLBB", name: "Mobile Legends", icon: "fa-solid fa-shield-halved" },
    { code: "PUBG", name: "PUBG Mobile", icon: "fa-solid fa-crosshairs" },
    { code: "FF", name: "Free Fire", icon: "fa-solid fa-fire" },
    { code: "VALO", name: "Valorant", icon: "fa-solid fa-skull" },
    { code: "DOTA", name: "Dota 2", icon: "fa-solid fa-khanda" },
    { code: "GENSHIN", name: "Genshin Impact", icon: "fa-solid fa-wind" },
    { code: "HOK", name: "Honor of Kings", icon: "fa-solid fa-crown" },
    { code: "ROBLOX", name: "Roblox", icon: "fa-solid fa-cubes" },
    { code: "WOS", name: "Whiteout Survival", icon: "fa-solid fa-snowflake" }
  ];

  // Koleksi Avatar Karakter DiceBear
  const avatarSeeds = [
    "Jordyn", "Alena", "Carl", "Davis", "Isona", "Makenna",
    "Kianna", "Maxith", "Zain", "Felix", "Jack", "Aneka"
  ];

  const currentAvatarPreview = document.getElementById("currentAvatarPreview");
  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileDisplayEmail = document.getElementById("profileDisplayEmail");
  const profileBadgesPreview = document.getElementById("profileBadgesPreview");
  const avatarPickerGrid = document.getElementById("avatarPickerGrid");
  const selectedAvatarInput = document.getElementById("selectedAvatarInput");
  const gameBadgesGrid = document.getElementById("gameBadgesGrid");
  const badgeCounter = document.getElementById("badgeCounter");
  const fullNameInput = document.getElementById("fullNameInput");
  const whatsappInput = document.getElementById("whatsappInput");
  const emailInput = document.getElementById("emailInput");
  const profileForm = document.getElementById("profileForm");
  const profileAlert = document.getElementById("profileAlert");
  const btnSaveProfile = document.getElementById("btnSaveProfile");

  let selectedGames = [];
  let currentUserId = null;

  // Render Grid Pilihan Avatar
  function renderAvatarChoices(activeUrl) {
    if (!avatarPickerGrid) return;
    avatarPickerGrid.innerHTML = avatarSeeds.map(seed => {
      const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
      const isActive = activeUrl === url ? "active" : "";
      return `
        <div class="avatar-choice-item ${isActive}" data-url="${url}">
          <img src="${url}" alt="${seed}">
        </div>
      `;
    }).join("");

    document.querySelectorAll(".avatar-choice-item").forEach(item => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".avatar-choice-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        const newUrl = item.getAttribute("data-url");
        if (selectedAvatarInput) selectedAvatarInput.value = newUrl;
        if (currentAvatarPreview) currentAvatarPreview.src = newUrl;
      });
    });
  }

  // Render Badges Game UI
  function updateBadgeUI() {
    if (badgeCounter) {
      badgeCounter.innerText = `${selectedGames.length}/3 Terpilih`;
      if (selectedGames.length === 3) {
        badgeCounter.classList.add("full");
      } else {
        badgeCounter.classList.remove("full");
      }
    }

    if (profileBadgesPreview) {
      if (selectedGames.length === 0) {
        profileBadgesPreview.innerHTML = `<span class="empty-badge-text">Belum memilih game favorit</span>`;
      } else {
        profileBadgesPreview.innerHTML = selectedGames.map(code => {
          const game = availableGames.find(g => g.code === code) || { name: code, icon: "fa-solid fa-gamepad" };
          return `
            <div class="user-game-pill">
              <i class="${game.icon}"></i>
              <span>${game.name}</span>
            </div>
          `;
        }).join("");
      }
    }

    document.querySelectorAll(".game-badge-select-item").forEach(el => {
      const code = el.getAttribute("data-code");
      if (selectedGames.includes(code)) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    });
  }

  // Render Grid Pilihan Game
  function renderGameChoices() {
    if (!gameBadgesGrid) return;
    gameBadgesGrid.innerHTML = availableGames.map(g => `
      <div class="game-badge-select-item" data-code="${g.code}">
        <i class="fa-solid fa-check badge-check-icon"></i>
        <i class="${g.icon}"></i>
        <span>${g.name}</span>
      </div>
    `).join("");

    document.querySelectorAll(".game-badge-select-item").forEach(item => {
      item.addEventListener("click", () => {
        const code = item.getAttribute("data-code");
        if (selectedGames.includes(code)) {
          selectedGames = selectedGames.filter(c => c !== code);
        } else {
          if (selectedGames.length >= 3) {
            showToast("error", "Batas Tercapai", "Kamu hanya bisa memilih maksimal 3 game favorit.");
            return;
          }
          selectedGames.push(code);
        }
        updateBadgeUI();
      });
    });
  }

  renderAvatarChoices("");
  renderGameChoices();

  // Load Profil User dari Supabase
  async function initUserProfile() {
    const stored = localStorage.getItem("mgs_user");
    const localUser = stored ? JSON.parse(stored) : null;

    if (localUser) {
      currentUserId = localUser.id;
      if (emailInput) emailInput.value = localUser.email || "";
      if (profileDisplayEmail) profileDisplayEmail.innerText = localUser.email || "";
      if (profileDisplayName) profileDisplayName.innerText = localUser.user_metadata?.full_name || "Gamers Sultan";
      if (fullNameInput) fullNameInput.value = localUser.user_metadata?.full_name || "";
    }

    const client = getClient();
    if (!client) {
      setTimeout(initUserProfile, 200);
      return;
    }

    try {
      const { data: { session } } = await client.auth.getSession();
      if (session) {
        currentUserId = session.user.id;
        if (emailInput) emailInput.value = session.user.email || "";
        if (profileDisplayEmail) profileDisplayEmail.innerText = session.user.email || "";
      }

      if (!currentUserId) {
        window.location.href = "/auth/login.html";
        return;
      }

      const { data: profile, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .maybeSingle();

      if (profile) {
        if (fullNameInput) fullNameInput.value = profile.full_name || "";
        if (whatsappInput) whatsappInput.value = profile.whatsapp || "";
        if (profileDisplayName) profileDisplayName.innerText = profile.full_name || "Gamers Sultan";

        const activeUrl = profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=Jordyn`;
        if (selectedAvatarInput) selectedAvatarInput.value = activeUrl;
        if (currentAvatarPreview) currentAvatarPreview.src = activeUrl;
        renderAvatarChoices(activeUrl);

        selectedGames = Array.isArray(profile.favorite_games) ? profile.favorite_games : [];
        updateBadgeUI();
      }
    } catch (err) {
      console.warn("Profil load issue:", err.message);
    }
  }

  initUserProfile();

  // ==========================================
  // HANDLER SUBMIT PROFIL & CEK NOMOR GANDA
  // ==========================================
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const client = getClient();
    if (!client || !currentUserId) return;

    let cleanWA = whatsappInput.value.trim().replace(/[^0-9]/g, "");

    // Validasi dasar nomor WA
    if (!cleanWA) {
      showToast("error", "Data Belum Lengkap", "Nomor WhatsApp wajib diisi untuk transaksi & Rekber!");
      whatsappInput.focus();
      return;
    }

    // Normalisasi format (08xx -> 628xx)
    if (cleanWA.startsWith("0")) {
      cleanWA = "62" + cleanWA.substring(1);
    }

    if (cleanWA.length < 10) {
      showToast("error", "Format Tidak Valid", "Masukkan nomor WhatsApp yang aktif dan benar!");
      whatsappInput.focus();
      return;
    }

    btnSaveProfile.disabled = true;
    btnSaveProfile.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa...`;

    try {
      // 1. Cek apakah nomor WA ini sudah pernah digunakan oleh user lain
      const { data: duplicateWA, error: checkErr } = await client
        .from("profiles")
        .select("id")
        .eq("whatsapp", cleanWA)
        .neq("id", currentUserId)
        .maybeSingle();

      if (checkErr) throw checkErr;

      if (duplicateWA) {
        btnSaveProfile.disabled = false;
        btnSaveProfile.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Profil`;
        showToast("error", "Nomor Sudah Digunakan", "Nomor WhatsApp ini sudah terdaftar di akun lain. Silakan pakai nomor lain!");
        whatsappInput.focus();
        return;
      }

      // 2. Simpan data profil baru
      btnSaveProfile.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

      const updatePayload = {
        full_name: fullNameInput.value.trim(),
        whatsapp: cleanWA,
        avatar_url: selectedAvatarInput.value,
        favorite_games: selectedGames
      };

      const { error: updateErr } = await client
        .from("profiles")
        .update(updatePayload)
        .eq("id", currentUserId);

      if (updateErr) {
        // Tangkap jika terkena proteksi UNIQUE constraint database
        if (updateErr.code === "23505" || updateErr.message.includes("unique")) {
          throw new Error("Nomor WhatsApp ini sudah terdaftar di akun lain.");
        }
        throw updateErr;
      }

      // Update UI langsung
      whatsappInput.value = cleanWA;
      if (profileDisplayName) profileDisplayName.innerText = updatePayload.full_name;

      btnSaveProfile.disabled = false;
      btnSaveProfile.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Profil`;

      showToast("success", "Perubahan Disimpan!", "Profil, WhatsApp, Avatar & Game favorit berhasil diperbarui.");
      updateBadgeUI();

    } catch (err) {
      btnSaveProfile.disabled = false;
      btnSaveProfile.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Profil`;
      showToast("error", "Gagal Menyimpan", err.message || "Terjadi kesalahan saat menyimpan profil.");
    }
  });
});