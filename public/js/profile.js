document.addEventListener("DOMContentLoaded", async () => {
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

  // Koleksi Avatar 3D DiceBear
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
  const customAvatarFileInput = document.getElementById("customAvatarFileInput");
  const uploadStatusText = document.getElementById("uploadStatusText");

  let selectedGames = [];
  let currentUserId = null;

  // Render Grid Avatar Awal
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
        selectedAvatarInput.value = newUrl;
        currentAvatarPreview.src = newUrl;
        if (uploadStatusText) uploadStatusText.innerText = "";
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
            alert("Kamu hanya bisa memilih maksimal 3 game favorit.");
            return;
          }
          selectedGames.push(code);
        }
        updateBadgeUI();
      });
    });
  }

  // Jalankan render grid awal
  renderAvatarChoices("");
  renderGameChoices();

  // Handler Upload Foto Custom Sendiri (Maks 2MB)
  if (customAvatarFileInput) {
    customAvatarFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validasi Ukuran Maksimal 2MB (2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Ukuran file terlalu besar! Maksimal ukuran foto adalah 2MB.");
        customAvatarFileInput.value = "";
        return;
      }

      // Validasi Format Gambar
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Format file tidak didukung! Gunakan format JPG, PNG, atau WebP.");
        customAvatarFileInput.value = "";
        return;
      }

      // Baca File secara lokal (Base64 DataURL)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        selectedAvatarInput.value = base64Url;
        currentAvatarPreview.src = base64Url;
        if (uploadStatusText) {
          uploadStatusText.innerText = `✓ Foto (${(file.size / 1024).toFixed(0)} KB) siap disimpan`;
        }
        document.querySelectorAll(".avatar-choice-item").forEach(el => el.classList.remove("active"));
      };
      reader.readAsDataURL(file);
    });
  }

  // Load Profil User dari Supabase / Local Storage
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
        selectedAvatarInput.value = activeUrl;
        currentAvatarPreview.src = activeUrl;
        renderAvatarChoices(activeUrl);

        selectedGames = Array.isArray(profile.favorite_games) ? profile.favorite_games : [];
        updateBadgeUI();
      }
    } catch (err) {
      console.warn("Profil load issue:", err.message);
    }
  }

  initUserProfile();

  // Simpan Perubahan Profil
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const client = getClient();
    if (!client || !currentUserId) return;

    btnSaveProfile.disabled = true;
    btnSaveProfile.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;
    profileAlert.style.display = "none";

    const updatePayload = {
      full_name: fullNameInput.value.trim(),
      whatsapp: whatsappInput.value.trim(),
      avatar_url: selectedAvatarInput.value,
      favorite_games: selectedGames
    };

    const { error } = await client
      .from("profiles")
      .update(updatePayload)
      .eq("id", currentUserId);

    btnSaveProfile.disabled = false;
    btnSaveProfile.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Profil`;

    if (error) {
      profileAlert.className = "alert-box alert-error";
      profileAlert.innerText = `Gagal menyimpan: ${error.message}`;
      profileAlert.style.display = "block";
    } else {
      if (profileDisplayName) profileDisplayName.innerText = updatePayload.full_name;
      profileAlert.className = "alert-box alert-success";
      profileAlert.innerText = "Profil, Foto/Avatar, & 3 Badge Game Favorit berhasil disimpan!";
      profileAlert.style.display = "block";
      updateBadgeUI();
    }
  });
});