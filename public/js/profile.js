document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const client = getClient();
  if (!client) {
    console.error("Supabase client belum siap");
    return;
  }

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

  // Daftar Pilihan Game & Ikon FontAwesome
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

  let currentUserId = null;
  let selectedGames = []; // Maksimal 3 game

  // 1. Cek sesi auth
  const { data: { session }, error: authErr } = await client.auth.getSession();
  if (authErr || !session) {
    alert("Silakan login terlebih dahulu untuk mengakses profil.");
    window.location.href = "/auth/login.html";
    return;
  }

  currentUserId = session.user.id;
  emailInput.value = session.user.email || "";
  profileDisplayEmail.innerText = session.user.email || "";

  // 2. Load data profil dari Supabase
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", currentUserId)
    .single();

  let activeAvatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=Jordyn`;
  selectedGames = Array.isArray(profile?.favorite_games) ? profile.favorite_games : [];

  if (profile) {
    fullNameInput.value = profile.full_name || "";
    whatsappInput.value = profile.whatsapp || "";
    profileDisplayName.innerText = profile.full_name || "Gamers Sultan";
  }

  selectedAvatarInput.value = activeAvatarUrl;
  currentAvatarPreview.src = activeAvatarUrl;

  // 3. Render Avatar Picker
  avatarPickerGrid.innerHTML = avatarSeeds.map(seed => {
    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
    const isActive = activeAvatarUrl === url ? "active" : "";
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
    });
  });

  // 4. Render Game Badges Selector & Preview
  function updateBadgeUI() {
    // Update Counter
    badgeCounter.innerText = `${selectedGames.length}/3 Terpilih`;
    if (selectedGames.length === 3) {
      badgeCounter.classList.add("full");
    } else {
      badgeCounter.classList.remove("full");
    }

    // Update Header Badges Preview
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

    // Update Grid Selection State
    document.querySelectorAll(".game-badge-select-item").forEach(el => {
      const code = el.getAttribute("data-code");
      if (selectedGames.includes(code)) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    });
  }

  // Render Grid Badges
  gameBadgesGrid.innerHTML = availableGames.map(g => `
    <div class="game-badge-select-item" data-code="${g.code}">
      <i class="fa-solid fa-check badge-check-icon"></i>
      <i class="${g.icon}"></i>
      <span>${g.name}</span>
    </div>
  `).join("");

  // Event Click Badge Grid (Max 3)
  document.querySelectorAll(".game-badge-select-item").forEach(item => {
    item.addEventListener("click", () => {
      const code = item.getAttribute("data-code");

      if (selectedGames.includes(code)) {
        // Hapus jika sudah terpilih
        selectedGames = selectedGames.filter(c => c !== code);
      } else {
        // Cek kuota maksimal 3
        if (selectedGames.length >= 3) {
          alert("Kamu hanya bisa memilih maksimal 3 game favorit.");
          return;
        }
        selectedGames.push(code);
      }
      updateBadgeUI();
    });
  });

  // Panggil pertama kali
  updateBadgeUI();

  // 5. Simpan Perubahan Profil ke Supabase
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
      profileAlert.innerText = `Gagal menyimpan profil: ${error.message}`;
      profileAlert.style.display = "block";
    } else {
      profileDisplayName.innerText = updatePayload.full_name;
      profileAlert.className = "alert-box alert-success";
      profileAlert.innerText = "Profil, Avatar, & 3 Badge Game Favorit berhasil disimpan!";
      profileAlert.style.display = "block";
    }
  });
});