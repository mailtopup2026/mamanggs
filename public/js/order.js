document.addEventListener("DOMContentLoaded", async () => {
  // Metadata Game Default (Digiflazz)
  const gamesMeta = {
    mlbb: {
      code: "mlbb",
      brandQuery: "MOBILE LEGEND",
      title: "Mobile Legends: Bang Bang",
      dev: "Moonton",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      supportsCheck: true
    },
    ff: {
      code: "ff",
      brandQuery: "FREE FIRE",
      title: "Free Fire",
      dev: "Garena",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: true
    },
    pubg: {
      code: "pubg",
      brandQuery: "PUBG",
      title: "PUBG Mobile",
      dev: "Level Infinite",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: true
    },
    codm: {
      code: "codm",
      brandQuery: "CALL OF DUTY",
      title: "Call of Duty: Mobile",
      dev: "Garena / Activision",
      banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: true
    },
    aov: {
      code: "aov",
      brandQuery: "ARENA OF VALOR",
      title: "Arena of Valor (AOV)",
      dev: "Garena",
      banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: true
    },
    ragnarok: {
      code: "ragnarok",
      brandQuery: "RAGNAROK",
      title: "Ragnarok M: Eternal Love",
      dev: "Gravity Interactive",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      supportsCheck: false
    },
    whiteout: {
      code: "whiteout",
      brandQuery: "WHITEOUT",
      title: "Whiteout Survival",
      dev: "Century Games",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: false
    },
    lords: {
      code: "lords",
      brandQuery: "LORDS MOBILE",
      title: "Lords Mobile",
      dev: "IGG",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: false
    },
    pb: {
      code: "pb",
      brandQuery: "POINT BLANK",
      title: "Point Blank",
      dev: "Zepetto",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: false
    },
    laplace: {
      code: "laplace",
      brandQuery: "LAPLACE",
      title: "Laplace M",
      dev: "ZlongGames",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      supportsCheck: false
    },
    au2: {
      code: "au2",
      brandQuery: "AU2",
      title: "AU2 Mobile",
      dev: "VTC Game",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      supportsCheck: false
    },
    garena: {
      code: "garena",
      brandQuery: "GARENA",
      title: "Garena Shell",
      dev: "Garena",
      banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: false
    },
    genshin: {
      code: "genshin",
      brandQuery: "GENSHIN",
      title: "Genshin Impact",
      dev: "HoYoverse",
      banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      supportsCheck: true
    },
    valorant: {
      code: "valorant",
      brandQuery: "VALORANT",
      title: "Valorant Points",
      dev: "Riot Games",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: false
    },
    hok: {
      code: "hok",
      brandQuery: "HONOR OF KINGS",
      title: "Honor of Kings",
      dev: "Level Infinite",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      supportsCheck: true
    }
  };

  const params = new URLSearchParams(window.location.search);
  const gameKey = (params.get("game") || "mlbb").toLowerCase();
  const urlType = params.get("type");

  let isManualGame = (urlType === "manual");
  let currentGame = gamesMeta[gameKey] || {
    code: gameKey,
    brandQuery: gameKey.toUpperCase(),
    title: gameKey.toUpperCase(),
    dev: "Official",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    hasZone: false,
    supportsCheck: false
  };

  // 1. CEK APAKAH INI GAME MANUAL DARI DATABASE
  try {
    const { data: manualData } = await window.supabase
      .from("manual_games")
      .select("*")
      .eq("slug", gameKey)
      .maybeSingle();

    if (manualData) {
      isManualGame = true;
      currentGame = {
        code: manualData.slug,
        title: manualData.name,
        dev: manualData.publisher || "Century Games",
        banner: manualData.image_url,
        hasZone: false,
        supportsCheck: false
      };
    }
  } catch (err) {
    console.warn("Pengecekan manual game:", err);
  }

  // Update Tampilan Informasi Game
  if (document.getElementById("gameTitle")) document.getElementById("gameTitle").innerText = currentGame.title;
  if (document.getElementById("gameDev")) document.getElementById("gameDev").innerText = currentGame.dev;
  if (document.getElementById("gameBanner")) document.getElementById("gameBanner").src = currentGame.banner;

  const zoneGroup = document.getElementById("zoneGroup");
  if (!currentGame.hasZone && zoneGroup) zoneGroup.style.display = "none";

  let selectedItem = null;
  let selectedPayment = "Pilih Cara Pembayaran";
  let verifiedNickname = null;
  let cachedUserBalance = 0;
  let liveUsdRate = 17000;

  let appliedPromo = null;
  let currentDiscountAmount = 0;
  let finalCalculatedPrice = 0;

  // ==========================================
  // LOGIKA TAMPILAN JASTIP (MANUAL VIA LOGIN)
  // ==========================================
  if (isManualGame) {
    const stepAccountTitle = document.getElementById("stepAccountTitle");
    if (stepAccountTitle) stepAccountTitle.innerText = "Informasi Akun Game";

    const labelUser = document.getElementById("labelUserId");
    if (labelUser) labelUser.innerText = "Akun / ID Game / Nama Karakter";

    const userInput = document.getElementById("userIdInput");
    if (userInput) userInput.placeholder = "Masukkan ID atau nama karakter game";

    if (zoneGroup) zoneGroup.style.display = "none";

    const instructionList = document.getElementById("instructionList");
    if (instructionList) {
      instructionList.innerHTML = `
        <li>Pilih paket pack USD yang sesuai dengan harga bundle in-game Anda.</li>
        <li>Pilih jalur pembayaran (Otomatis DOKU / Saldo MGS).</li>
        <li>Gunakan kupon promo jika memiliki kode diskon.</li>
        <li>Masukkan nomor WhatsApp aktif Anda.</li>
        <li>Setelah pembayaran selesai, konfirmasi ke WhatsApp Admin untuk proses login & pengisian bundle.</li>
      `;
    }

    const rateNotice = document.getElementById("manualRateNoticeBox");
    if (rateNotice) rateNotice.style.display = "block";
  }

  // ==========================================
  // SINKRONISASI SALDO USER
  // ==========================================
  async function syncUserBalanceDisplay() {
    try {
      if (!window.supabase) return;
      const { data: sessionData } = await window.supabase.auth.getSession();
      const userUuid = sessionData?.session?.user?.id;

      if (userUuid) {
        const { data: profile } = await window.supabase
          .from("profiles")
          .select("balance")
          .eq("id", userUuid)
          .maybeSingle();

        if (profile && profile.balance !== undefined) {
          cachedUserBalance = Number(profile.balance || 0);

          document.querySelectorAll(".payment-card").forEach(card => {
            const spanText = card.querySelector(".payment-brand span");
            if (spanText && spanText.innerText.toLowerCase().includes("saldo")) {
              spanText.innerHTML = `Saldo MGS <small style="color: #10b981; font-size: 0.78rem; font-weight: 700;">(Rp ${cachedUserBalance.toLocaleString("id-ID")})</small>`;
            }
          });
        }
      }
    } catch (e) {
      console.warn("Gagal sinkron saldo:", e);
    }
  }

  const checkBalanceInterval = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkBalanceInterval);
      syncUserBalanceDisplay();
    }
  }, 100);

  // ==========================================
  // KALKULASI HARGA & PROMO
  // ==========================================
  function updateCheckoutPricing() {
    if (!selectedItem) return;

    const originalPriceEl = document.getElementById("summaryOriginalPrice");
    const discountRow = document.getElementById("rowDiscount");
    const discountValEl = document.getElementById("summaryDiscountValue");
    const promoCodeEl = document.getElementById("summaryPromoCode");
    const finalPriceEl = document.getElementById("summaryFinalPrice");

    const basePrice = Number(selectedItem.price || 0);
    currentDiscountAmount = 0;

    if (appliedPromo) {
      if (basePrice < Number(appliedPromo.min_order)) {
        appliedPromo = null;
        showPromoFeedback(`Kupon dibatalkan: Syarat minimal belanja Rp ${Number(appliedPromo?.min_order || 0).toLocaleString("id-ID")}`, false);
      } else {
        if (appliedPromo.discount_type === "FIXED") {
          currentDiscountAmount = Number(appliedPromo.discount_value);
        } else if (appliedPromo.discount_type === "PERCENT") {
          let calc = (basePrice * Number(appliedPromo.discount_value)) / 100;
          if (appliedPromo.max_discount && calc > Number(appliedPromo.max_discount)) {
            calc = Number(appliedPromo.max_discount);
          }
          currentDiscountAmount = calc;
        }
      }
    }

    finalCalculatedPrice = Math.max(0, basePrice - currentDiscountAmount);

    if (originalPriceEl) originalPriceEl.innerText = `Rp ${basePrice.toLocaleString("id-ID")}`;

    if (currentDiscountAmount > 0 && appliedPromo) {
      if (discountRow) discountRow.style.display = "flex";
      if (promoCodeEl) promoCodeEl.innerText = appliedPromo.code;
      if (discountValEl) discountValEl.innerText = `- Rp ${Number(currentDiscountAmount).toLocaleString("id-ID")}`;
    } else {
      if (discountRow) discountRow.style.display = "none";
    }

    if (finalPriceEl) finalPriceEl.innerText = `Rp ${Number(finalCalculatedPrice).toLocaleString("id-ID")}`;
  }

  function showPromoFeedback(message, isSuccess) {
    const msgEl = document.getElementById("promoMessage");
    if (!msgEl) return;
    msgEl.style.display = "block";
    msgEl.style.color = isSuccess ? "#10b981" : "#e63946";
    msgEl.innerText = message;
  }

  // Listener Promo
  const btnApplyPromo = document.getElementById("btnApplyPromo");
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener("click", async () => {
      const codeInput = document.getElementById("inputPromoCode");
      const code = codeInput?.value.trim().toUpperCase();

      if (!code) {
        showPromoFeedback("Ketik kode promo terlebih dahulu!", false);
        return;
      }

      const basePrice = Number(selectedItem?.price || 0);

      try {
        const { data: promo, error } = await window.supabase
          .from("promos")
          .select("*")
          .eq("code", code)
          .eq("is_active", true)
          .single();

        if (error || !promo) {
          appliedPromo = null;
          showPromoFeedback("Kode promo tidak valid atau telah berakhir.", false);
          updateCheckoutPricing();
          return;
        }

        if (basePrice < Number(promo.min_order)) {
          appliedPromo = null;
          showPromoFeedback(`Minimal belanja untuk kupon ini adalah Rp ${Number(promo.min_order).toLocaleString("id-ID")}`, false);
          updateCheckoutPricing();
          return;
        }

        appliedPromo = promo;
        const infoDiskon = promo.discount_type === "FIXED" 
          ? `Rp ${Number(promo.discount_value).toLocaleString("id-ID")}` 
          : `${promo.discount_value}%`;

        showPromoFeedback(`🎉 Promo diterapkan! Hemat ${infoDiskon}`, true);
        updateCheckoutPricing();
      } catch (err) {
        showPromoFeedback("Terjadi kesalahan memeriksa kupon.", false);
      }
    });
  }

  // ==========================================
  // RENDER NOMINAL PRODUK (DIGIFLAZZ VS JASTIP USD)
  // ==========================================
  const nominalContainer = document.getElementById("nominalContainer");
  nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat katalog produk...</div>`;

  if (isManualGame) {
    // ----------------------------------------------------
    // ALUR JASTIP USD DINAMIS (WHITEOUT SURVIVAL / MANUAL)
    // ----------------------------------------------------
    try {
      const { data: rateData } = await window.supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "usd_rate")
        .single();

      if (rateData && rateData.setting_value) {
        liveUsdRate = Number(rateData.setting_value);
      }

      const manualLiveRateText = document.getElementById("manualLiveRateText");
      if (manualLiveRateText) manualLiveRateText.innerText = liveUsdRate.toLocaleString("id-ID");

      // Daftar tier USD sesuai harga in-game
      const usdPacks = [
        { usd: 1, labelInGame: "Setara pack Rp 19.000 in-game" },
        { usd: 2, labelInGame: "Setara pack Rp 29.000 in-game" },
        { usd: 3, labelInGame: "Setara pack Rp 49.000 in-game" },
        { usd: 5, labelInGame: "Setara pack Rp 89.000 in-game" },
        { usd: 10, labelInGame: "Setara pack Rp 169.000 in-game" },
        { usd: 20, labelInGame: "Setara pack Rp 369.000 in-game" },
        { usd: 50, labelInGame: "Setara pack Rp 799.000 in-game" },
        { usd: 100, labelInGame: "Setara pack Rp 1.699.000 in-game" }
      ];

      nominalContainer.innerHTML = "";

      usdPacks.forEach((pack, index) => {
        const itemPrice = pack.usd * liveUsdRate;
        const itemObj = {
          sku: `MANUAL-${currentGame.code.toUpperCase()}-${pack.usd}USD`,
          name: `Bundle Pack $${pack.usd} USD`,
          price: itemPrice,
          usd_amount: pack.usd
        };

        if (index === 0) selectedItem = itemObj;

        const card = document.createElement("div");
        card.className = "nominal-card" + (index === 0 ? " selected" : "");
        card.innerHTML = `
          <div class="nominal-title" style="font-size: 0.95rem; font-weight: 800; color: #fff;">Pack $${pack.usd} USD</div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin: 3px 0;">${pack.labelInGame}</div>
          <div class="nominal-price" style="color: #10b981; font-weight: 800;">Rp ${itemPrice.toLocaleString("id-ID")}</div>
        `;

        card.addEventListener("click", () => {
          document.querySelectorAll(".nominal-card").forEach((c) => c.classList.remove("selected"));
          card.classList.add("selected");
          selectedItem = itemObj;
          updateCheckoutPricing();
        });

        nominalContainer.appendChild(card);
      });

      updateCheckoutPricing();
    } catch (err) {
      console.error("Gagal load rate jastip:", err);
      nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e63946; padding: 20px;">Gagal memuat tier kurs USD.</div>`;
    }

  } else {
    // ----------------------------------------------------
    // ALUR DIGIFLAZZ BIASA
    // ----------------------------------------------------
    try {
      try {
        const { data: dbCover } = await window.supabase
          .from("game_covers")
          .select("*")
          .ilike("game_code", currentGame.code)
          .maybeSingle();

        if (dbCover && dbCover.banner_url && document.getElementById("gameBanner")) {
          document.getElementById("gameBanner").src = dbCover.banner_url;
        }
      } catch (coverErr) {}

      let query = window.supabase
        .from("products")
        .select("*")
        .eq("buyer_product_status", true);

      if (currentGame.brandQuery) {
        query = query.ilike("brand", `%${currentGame.brandQuery}%`);
      } else {
        query = query.ilike("game_code", `%${currentGame.code}%`);
      }

      const { data: dbProducts, error: dbError } = await query.order("price_sell", { ascending: true });

      if (dbError) throw dbError;

      if (!dbProducts || dbProducts.length === 0) {
        nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">Produk game ini sedang disiapkan atau dinonaktifkan di Admin.</div>`;
      } else {
        nominalContainer.innerHTML = "";

        dbProducts.forEach((prod, index) => {
          const itemObj = {
            sku: prod.buyer_sku_code,
            name: prod.product_name,
            price: Number(prod.price_sell)
          };

          if (index === 0) selectedItem = itemObj;

          const card = document.createElement("div");
          card.className = "nominal-card" + (index === 0 ? " selected" : "");
          const formattedPrice = Number(prod.price_sell).toLocaleString("id-ID");
          
          card.innerHTML = `
            <div class="nominal-title">${prod.product_name}</div>
            <div class="nominal-price">Rp ${formattedPrice}</div>
          `;

          card.addEventListener("click", () => {
            document.querySelectorAll(".nominal-card").forEach((c) => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedItem = itemObj;
            updateCheckoutPricing();
          });

          nominalContainer.appendChild(card);
        });

        updateCheckoutPricing();
      }
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
      nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e63946; padding: 20px;">Gagal memuat katalog produk.</div>`;
    }
  }

  // Handle Pilih Metode Bayar
  const checkoutBtn = document.getElementById("checkoutBtn");
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const spanTitle = card.querySelector(".payment-brand span");
      if (spanTitle) selectedPayment = spanTitle.innerText.trim();

      if (selectedPayment.toLowerCase().includes("saldo")) {
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS';
      } else {
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli dan Pilih Cara Pembayaran';
      }
    });
  });

  // Modal Saldo Tidak Cukup
  function showInsufficientBalanceModal(currentBal, totalPay) {
    const modalEl = document.getElementById("insufficientBalanceModal");
    const userBalEl = document.getElementById("modalUserBalanceText");
    const reqAmountEl = document.getElementById("modalRequiredAmountText");
    const btnClose = document.getElementById("btnCloseBalModal");

    if (userBalEl) userBalEl.innerText = "Rp " + Number(currentBal || 0).toLocaleString("id-ID");
    if (reqAmountEl) reqAmountEl.innerText = "Rp " + Number(totalPay || 0).toLocaleString("id-ID");

    if (modalEl) {
      modalEl.style.display = "flex";
      if (btnClose) {
        btnClose.onclick = () => { modalEl.style.display = "none"; };
      }
      modalEl.onclick = (e) => {
        if (e.target === modalEl) modalEl.style.display = "none";
      };
    }
  }

  // Cek ID / Nickname Otomatis
  const userIdInput = document.getElementById("userIdInput");
  const zoneIdInput = document.getElementById("zoneIdInput");
  const idCheckSpinner = document.getElementById("idCheckSpinner");
  const nicknameBox = document.getElementById("nicknameBox");

  let checkTimeout = null;

  if (!isManualGame && currentGame.supportsCheck) {
    async function checkNickname() {
      const uid = userIdInput.value.trim();
      const zid = currentGame.hasZone ? (zoneIdInput ? zoneIdInput.value.trim() : "") : "";

      if (!uid || (currentGame.hasZone && !zid)) {
        nicknameBox.style.display = "none";
        verifiedNickname = null;
        return;
      }

      if (uid.length < 4) return;

      idCheckSpinner.style.display = "block";
      nicknameBox.style.display = "none";

      try {
        const queryParams = new URLSearchParams({ game: currentGame.code, id: uid, zone: zid });
        const res = await fetch(`/api/check-id?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "User ID / Server tidak ditemukan.");

        verifiedNickname = data.name;
        nicknameBox.className = "nickname-result-box";
        nicknameBox.innerHTML = `
          <i class="fa-solid fa-circle-check"></i>
          <span>Nickname Akun: <strong>${data.name}</strong> (Terverifikasi)</span>
        `;
        nicknameBox.style.display = "flex";
      } catch (err) {
        nicknameBox.className = "nickname-result-box error";
        nicknameBox.innerHTML = `
          <i class="fa-solid fa-circle-xmark"></i>
          <span>${err.message || "User ID / Zone ID tidak valid."}</span>
        `;
        nicknameBox.style.display = "flex";
        verifiedNickname = null;
      } finally {
        idCheckSpinner.style.display = "none";
      }
    }

    userIdInput.addEventListener("input", () => {
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(checkNickname, 700);
    });

    if (zoneIdInput) {
      zoneIdInput.addEventListener("input", () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkNickname, 700);
      });
    }
  } else if (!isManualGame) {
    if (nicknameBox) {
      nicknameBox.className = "nickname-result-box";
      nicknameBox.style.background = "rgba(56, 189, 248, 0.08)";
      nicknameBox.style.borderColor = "rgba(56, 189, 248, 0.3)";
      nicknameBox.style.color = "#94a3b8";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-info" style="color: #38bdf8; font-size: 1.1rem; margin-top: 2px;"></i>
        <div style="font-size: 0.83rem; line-height: 1.45;">
          <span>Pastikan <strong>User ID</strong> sudah benar sebelum checkout.</span>
        </div>
      `;
      nicknameBox.style.display = "flex";
    }
  }

  // ==========================================
  // CHECKOUT HANDLER
  // ==========================================
  checkoutBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    const zoneId = (!isManualGame && currentGame.hasZone) ? zoneIdInput.value.trim() : null;
    const whatsapp = document.getElementById("whatsappInput").value.trim();

    if (!selectedItem) return alert("Harap pilih salah satu nominal produk!");
    if (!userId) return alert(isManualGame ? "Harap masukkan identitas/nama akun game kamu!" : "Harap masukkan User ID akun game kamu!");
    if (!isManualGame && currentGame.hasZone && !zoneId) return alert("Harap masukkan Zone ID / Server game kamu!");
    if (!whatsapp) return alert("Harap masukkan nomor WhatsApp aktif!");

    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Pesanan...';

    const now = new Date();
    const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `MGS-${dateStr}-${randomDigits}`;

    let userUuid = null;
    try {
      if (window.supabase) {
        const { data: sessionData } = await window.supabase.auth.getSession();
        if (sessionData?.session?.user?.id) userUuid = sessionData.session.user.id;
      }
    } catch (e) {}

    if (!userUuid) {
      const storedUser = localStorage.getItem("mgs_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          userUuid = u.id || null;
        } catch (e) {}
      }
    }

    const isUsingWallet = selectedPayment.toLowerCase().includes("saldo");
    let orderStatus = "PENDING";
    const totalToPay = Number(finalCalculatedPrice);
    let dokuPaymentData = null;

    if (isUsingWallet) {
      if (!userUuid) {
        alert("Metode Saldo MGS hanya berlaku untuk member yang sudah login.");
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS';
        return;
      }

      try {
        const { data: profile, error: profileErr } = await window.supabase
          .from("profiles")
          .select("balance")
          .eq("id", userUuid)
          .single();

        if (profileErr || !profile) throw new Error("Gagal mengambil data saldo akun.");

        const currentBal = Number(profile.balance) || 0;
        if (currentBal < totalToPay) {
          showInsufficientBalanceModal(currentBal, totalToPay);
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS';
          return;
        }

        const { data: deductSuccess, error: deductErr } = await window.supabase.rpc("deduct_user_balance", {
          user_uuid: userUuid,
          amount: totalToPay
        });

        if (deductErr || !deductSuccess) throw new Error("Gagal memproses pemotongan saldo. Silakan coba lagi.");

        orderStatus = "SUCCESS";
      } catch (err) {
        alert(err.message);
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS';
        return;
      }
    } else {
      try {
        const dokuRes = await fetch("/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: invoiceNumber,
            amount: totalToPay,
            paymentMethod: selectedPayment,
            customerPhone: whatsapp,
            customerName: verifiedNickname || "Pelanggan MamangGS"
          })
        });

        const dokuResult = await dokuRes.json();
        if (!dokuRes.ok || !dokuResult.success) throw new Error(dokuResult.error || "Gagal membuat tagihan pembayaran.");

        dokuPaymentData = dokuResult.data;
      } catch (err) {
        alert(`Gagal gateway: ${err.message}`);
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli dan Pilih Cara Pembayaran';
        return;
      }
    }

    try {
      const orderPayload = {
        invoice: invoiceNumber,
        game_code: currentGame.code,
        game_title: currentGame.title,
        account_id: userId,
        zone_id: zoneId || null,
        sku_code: selectedItem.sku,
        item_name: selectedItem.name,
        price: totalToPay,
        payment_method: selectedPayment,
        whatsapp: whatsapp,
        status: orderStatus,
        payment_data: dokuPaymentData || null,
        provider: isManualGame ? "manual" : "digiflazz"
      };

      if (userUuid) orderPayload.user_id = userUuid;

      const { error } = await window.supabase.from("orders").insert([orderPayload]);
      if (error) throw error;

      if (isManualGame) {
        const waMsg = encodeURIComponent(
`Halo Admin MamangGS! Saya baru saja melakukan pembayaran Top Up Jastip (Via Login).

📄 *Invoice:* ${invoiceNumber}
🎮 *Game:* ${currentGame.title}
📦 *Paket:* ${selectedItem.name}
💰 *Total Bayar:* Rp ${totalToPay.toLocaleString("id-ID")}
📱 *WhatsApp Saya:* ${whatsapp}
👤 *Akun/Karakter:* ${userId}

Saya siap mengirimkan data login dan screenshot bundle yang ingin dibeli.`
        );

        if (isUsingWallet) {
          alert("Pembayaran Berhasil! Mengalihkan ke WhatsApp Admin untuk proses pengisian...");
          window.location.href = `https://api.whatsapp.com/send?phone=6282210817006&text=${waMsg}`;
          return;
        }

        const paymentUrl =
          dokuPaymentData?.response?.payment?.url ||
          dokuPaymentData?.payment?.url ||
          dokuPaymentData?.response?.url ||
          dokuPaymentData?.payment_url ||
          dokuPaymentData?.url;

        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          window.location.href = `/order-status.html?inv=${encodeURIComponent(invoiceNumber)}`;
        }
        return;
      }

      if (isUsingWallet) {
        alert("Pembayaran Berhasil! Pesanan otomatis diproses.");
        window.location.href = `/order-status.html?inv=${encodeURIComponent(invoiceNumber)}`;
        return;
      }

      const paymentUrl =
        dokuPaymentData?.response?.payment?.url ||
        dokuPaymentData?.payment?.url ||
        dokuPaymentData?.response?.url ||
        dokuPaymentData?.payment_url ||
        dokuPaymentData?.url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        window.location.href = `/order-status.html?inv=${encodeURIComponent(invoiceNumber)}`;
      }
    } catch (err) {
      console.error("Error order:", err);
      alert("Gagal membuat pesanan: " + err.message);
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = selectedPayment.toLowerCase().includes("saldo")
        ? '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS'
        : '<i class="fa-solid fa-bolt"></i> Beli dan Pilih Cara Pembayaran';
    }
  });
});