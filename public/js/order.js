document.addEventListener("DOMContentLoaded", async () => {
  // Helper Notifikasi Cantik SweetAlert2
  const showToast = (type, title, text, timer = 2500) => {
    if (window.Swal) {
      return Swal.fire({
        icon: type,
        title: title,
        text: text,
        background: "#0f172a",
        color: "#f8fafc",
        iconColor: type === "success" ? "#10b981" : (type === "warning" ? "#f59e0b" : "#ef4444"),
        showConfirmButton: !timer,
        confirmButtonColor: "#10b981",
        timer: timer
      });
    } else {
      alert(`${title}\n${text}`);
    }
  };

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

  let isManualLoginGame = (urlType === "manual");
  let isManualIdGame = (urlType === "manual_id");
  let manualIdProductList = [];

  let currentGame = gamesMeta[gameKey] || {
    code: gameKey,
    brandQuery: gameKey.toUpperCase(),
    title: gameKey.toUpperCase(),
    dev: "Official",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    hasZone: false,
    supportsCheck: false
  };

  // 1. CEK TIPE GAME DARI DATABASE
  try {
    const { data: manualIdRows } = await window.supabase
      .from("manual_id_products")
      .select("*")
      .eq("game_slug", gameKey)
      .eq("is_active", true);

    if (manualIdRows && manualIdRows.length > 0) {
      isManualIdGame = true;
      isManualLoginGame = false;
      manualIdProductList = manualIdRows;
      const firstRow = manualIdRows[0];
      currentGame = {
        code: firstRow.game_slug,
        title: firstRow.game_name,
        dev: "Official Partner",
        banner: firstRow.game_image || currentGame.banner,
        hasZone: false,
        supportsCheck: false
      };
    } else if (!isManualIdGame) {
      const { data: manualData } = await window.supabase
        .from("manual_games")
        .select("*")
        .eq("slug", gameKey)
        .maybeSingle();

      if (manualData) {
        isManualLoginGame = true;
        currentGame = {
          code: manualData.slug,
          title: manualData.name,
          dev: manualData.publisher || "Official",
          banner: manualData.image_url,
          hasZone: false,
          supportsCheck: false
        };
      }
    }
  } catch (err) {
    console.warn("Pengecekan database game:", err);
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

  const isAnyManual = isManualLoginGame || isManualIdGame;
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Atur Metode Pembayaran Khusus Manual
  if (isAnyManual) {
    selectedPayment = "Saldo MGS";

    document.querySelectorAll(".payment-card").forEach(card => {
      const spanText = card.querySelector(".payment-brand span")?.innerText || "";
      if (spanText.toLowerCase().includes("saldo")) {
        card.classList.add("selected");
      } else {
        card.style.display = "none";
      }
    });

    if (checkoutBtn) {
      checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS';
    }
  }

  // Petunjuk khusus manual
  if (isManualLoginGame) {
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
        <li>Pembayaran pesanan via login hanya dapat menggunakan <strong>Saldo MGS</strong>.</li>
        <li>Gunakan kupon promo jika memiliki kode diskon.</li>
        <li>Masukkan nomor WhatsApp aktif Anda.</li>
        <li>Setelah saldo terpotong, sistem otomatis membuka WhatsApp Admin untuk konfirmasi data login & pembelian.</li>
      `;
    }

    const rateNotice = document.getElementById("manualRateNoticeBox");
    if (rateNotice) rateNotice.style.display = "block";
  }

  if (isManualIdGame) {
    const instructionList = document.getElementById("instructionList");
    if (instructionList) {
      instructionList.innerHTML = `
        <li>Masukkan <strong>User ID</strong> akun game Anda dengan teliti.</li>
        <li>Pilih paket nominal item yang diinginkan.</li>
        <li>Pembayaran produk manual via ID hanya dapat menggunakan <strong>Saldo MGS</strong>.</li>
        <li>Setelah checkout sukses, Anda akan langsung dialihkan ke WhatsApp Admin untuk proses pengisian cepat.</li>
      `;
    }
  }

  // Sinkronisasi Saldo
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

  // Kalkulasi Harga & Promo
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

  // Render Produk Nominal
  const nominalContainer = document.getElementById("nominalContainer");
  nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat katalog produk...</div>`;

  if (isManualIdGame) {
    try {
      if (!manualIdProductList || manualIdProductList.length === 0) {
        const { data: refreshedProducts } = await window.supabase
          .from("manual_id_products")
          .select("*")
          .eq("game_slug", currentGame.code)
          .eq("is_active", true)
          .order("price_sell", { ascending: true });

        manualIdProductList = refreshedProducts || [];
      }

      if (manualIdProductList.length === 0) {
        nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">Belum ada paket produk manual untuk game ini.</div>`;
      } else {
        nominalContainer.innerHTML = "";

        manualIdProductList.forEach((prod, index) => {
          const itemObj = {
            sku: `MANUAL-ID-${prod.id}`,
            name: prod.package_name,
            price: Number(prod.price_sell)
          };

          if (index === 0) selectedItem = itemObj;

          const card = document.createElement("div");
          card.className = "nominal-card" + (index === 0 ? " selected" : "");
          const formattedPrice = Number(prod.price_sell).toLocaleString("id-ID");

          card.innerHTML = `
            <div class="nominal-title">${prod.package_name}</div>
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
      console.error("Gagal load produk manual ID:", err);
      nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e63946; padding: 20px;">Gagal memuat katalog produk manual ID.</div>`;
    }

  } else if (isManualLoginGame) {
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
      console.error("Gagal load rate manual login:", err);
      nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e63946; padding: 20px;">Gagal memuat tier kurs USD.</div>`;
    }

  } else {
    try {
      try {
        const { data: dbCat } = await window.supabase
          .from("game_categories")
          .select("image_url, title, developer")
          .ilike("game_code", currentGame.code)
          .maybeSingle();

        if (dbCat) {
          if (dbCat.image_url && document.getElementById("gameBanner")) {
            document.getElementById("gameBanner").src = dbCat.image_url;
          }
          if (dbCat.title && document.getElementById("gameTitle")) {
            document.getElementById("gameTitle").innerText = dbCat.title;
          }
          if (dbCat.developer && document.getElementById("gameDev")) {
            document.getElementById("gameDev").innerText = dbCat.developer;
          }
        }
      } catch (coverErr) {
        console.warn("Gagal load cover game_categories:", coverErr);
      }

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

  // Pilih Metode Bayar (Digiflazz)
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (isAnyManual) return;

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

  // Modal Saldo Tidak Cukup (SweetAlert2)
  function showInsufficientBalanceModal(currentBal, totalPay) {
    if (window.Swal) {
      Swal.fire({
        icon: "warning",
        title: "Saldo MGS Tidak Cukup",
        html: `
          <div style="font-size: 0.9rem; line-height: 1.5; color: #cbd5e1;">
            <p style="margin-bottom: 8px;">Total belanja: <strong style="color: #fff;">Rp ${Number(totalPay).toLocaleString("id-ID")}</strong></p>
            <p style="margin-bottom: 14px;">Saldo akun saat ini: <strong style="color: #ef4444;">Rp ${Number(currentBal).toLocaleString("id-ID")}</strong></p>
            <p style="font-size: 0.8rem; color: #94a3b8;">Silakan lakukan pengisian saldo akun terlebih dahulu di dashboard member.</p>
          </div>
        `,
        background: "#0f172a",
        confirmButtonColor: "#10b981",
        confirmButtonText: '<i class="fa-solid fa-wallet"></i> Top Up Saldo',
        showCancelButton: true,
        cancelButtonColor: "#334155",
        cancelButtonText: "Tutup"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard.html";
        }
      });
    } else {
      alert(`Saldo tidak cukup!\nTotal: Rp ${Number(totalPay).toLocaleString("id-ID")}\nSaldo Anda: Rp ${Number(currentBal).toLocaleString("id-ID")}`);
    }
  }

  // ID / Nickname Check
  const userIdInput = document.getElementById("userIdInput");
  const zoneIdInput = document.getElementById("zoneIdInput");
  const idCheckSpinner = document.getElementById("idCheckSpinner");
  const nicknameBox = document.getElementById("nicknameBox");

  let checkTimeout = null;

  function renderDefaultAccountHint() {
    if (!nicknameBox || isManualLoginGame) return;

    nicknameBox.className = "nickname-result-box";
    nicknameBox.style.background = "rgba(56, 189, 248, 0.08)";
    nicknameBox.style.borderColor = "rgba(56, 189, 248, 0.3)";
    nicknameBox.style.color = "#94a3b8";

    nicknameBox.innerHTML = `
      <i class="fa-solid fa-circle-info" style="color: #38bdf8; font-size: 1.1rem; margin-top: 2px; flex-shrink: 0;"></i>
      <div style="font-size: 0.83rem; line-height: 1.45;">
        <div>Pastikan <strong>User ID</strong> sudah benar sebelum checkout.</div>
        <div style="margin-top: 2px;">
          Kamu juga bisa cek nama akun di: 
          <a href="https://imsela.com/tools/gameidchecker/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">
            Imsela Game ID Checker <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.72rem;"></i>
          </a>
        </div>
      </div>
    `;

    nicknameBox.style.display = "flex";
  }

  renderDefaultAccountHint();

  if (!isManualLoginGame && !isManualIdGame && currentGame.supportsCheck) {
    async function checkNickname() {
      const uid = userIdInput.value.trim();
      const zid = currentGame.hasZone ? (zoneIdInput ? zoneIdInput.value.trim() : "") : "";

      if (!uid || (currentGame.hasZone && !zid)) {
        renderDefaultAccountHint();
        verifiedNickname = null;
        return;
      }

      if (uid.length < 4) {
        renderDefaultAccountHint();
        return;
      }

      if (idCheckSpinner) idCheckSpinner.style.display = "block";

      try {
        const queryParams = new URLSearchParams({ game: currentGame.code, id: uid, zone: zid });
        const res = await fetch(`/api/check-id?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "User ID / Server tidak ditemukan.");

        verifiedNickname = data.name;
        nicknameBox.className = "nickname-result-box";
        nicknameBox.style.background = "rgba(16, 185, 129, 0.1)";
        nicknameBox.style.borderColor = "rgba(16, 185, 129, 0.4)";
        nicknameBox.style.color = "#fff";
        nicknameBox.innerHTML = `
          <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.1rem;"></i>
          <span>Nickname Akun: <strong style="color: #10b981;">${data.name}</strong> (Terverifikasi)</span>
        `;
        nicknameBox.style.display = "flex";
      } catch (err) {
        nicknameBox.className = "nickname-result-box error";
        nicknameBox.style.background = "rgba(239, 68, 68, 0.1)";
        nicknameBox.style.borderColor = "rgba(239, 68, 68, 0.4)";
        nicknameBox.style.color = "#ef4444";
        nicknameBox.innerHTML = `
          <i class="fa-solid fa-circle-xmark" style="font-size: 1.1rem;"></i>
          <span>${err.message || "User ID / Zone ID tidak valid."}</span>
        `;
        nicknameBox.style.display = "flex";
        verifiedNickname = null;
      } finally {
        if (idCheckSpinner) idCheckSpinner.style.display = "none";
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
  }

  // ==========================================
  // CHECKOUT HANDLER
  // ==========================================
  checkoutBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    const zoneId = (currentGame.hasZone && zoneIdInput) ? zoneIdInput.value.trim() : null;
    const whatsapp = document.getElementById("whatsappInput").value.trim();

    if (!selectedItem) {
      return showToast("warning", "Nominal Belum Dipilih", "Harap pilih salah satu nominal produk terlebih dahulu.");
    }
    if (!userId) {
      return showToast("warning", "Data Akun Kosong", isManualLoginGame ? "Harap masukkan identitas atau nama akun game kamu!" : "Harap masukkan User ID akun game kamu!");
    }
    if (!isManualLoginGame && !isManualIdGame && currentGame.hasZone && !zoneId) {
      return showToast("warning", "Zone ID Kosong", "Harap masukkan Zone ID / Server game kamu!");
    }
    if (!whatsapp) {
      return showToast("warning", "WhatsApp Kosong", "Harap masukkan nomor WhatsApp aktif untuk konfirmasi pesanan!");
    }

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

    const isUsingWallet = isAnyManual || selectedPayment.toLowerCase().includes("saldo");
    let orderStatus = "PENDING";
    const totalToPay = Number(finalCalculatedPrice);
    let dokuPaymentData = null;

    if (isUsingWallet) {
      if (!userUuid) {
        showToast("warning", "Login Diperlukan", isAnyManual 
          ? "Produk Manual wajib dibayar menggunakan Saldo MGS. Silakan login ke akun member terlebih dahulu!" 
          : "Metode Saldo MGS hanya berlaku untuk member yang sudah login.", 3500);
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
        showToast("error", "Transaksi Gagal", err.message);
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
        showToast("error", "Gagal Gateway", err.message);
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli dan Pilih Cara Pembayaran';
        return;
      }
    }

    try {
      let orderProvider = "digiflazz";
      if (isManualLoginGame) orderProvider = "manual_login";
      else if (isManualIdGame) orderProvider = "manual_id";

      const orderPayload = {
        invoice: invoiceNumber,
        game_code: currentGame.code,
        game_title: currentGame.title,
        account_id: userId,
        zone_id: zoneId || null,
        sku_code: selectedItem.sku,
        item_name: selectedItem.name,
        price: totalToPay,
        payment_method: isAnyManual ? "Saldo MGS" : selectedPayment,
        whatsapp: whatsapp,
        status: orderStatus,
        payment_data: dokuPaymentData || null,
        provider: orderProvider
      };

      if (userUuid) orderPayload.user_id = userUuid;

      const { error } = await window.supabase.from("orders").insert([orderPayload]);
      if (error) throw error;

      // Data Akun Dinamis
      let accountDisplay = userId;
      if (zoneId) {
        accountDisplay = `${userId} (${zoneId})`;
      }
      if (verifiedNickname) {
        accountDisplay += ` [${verifiedNickname}]`;
      }

      // 1. JIKA MANUAL VIA LOGIN -> MODAL KARAKTER JEMPOL & DIRECT WA
      if (isManualLoginGame) {
        const waMsg = encodeURIComponent(
`Halo Admin MamangGS! Saya baru saja melakukan pembayaran Top Up (Via Login).

📄 *Invoice:* ${invoiceNumber}
🎮 *Game:* ${currentGame.title}
📦 *Paket:* ${selectedItem.name}
💰 *Total Bayar:* Rp ${totalToPay.toLocaleString("id-ID")}
💳 *Metode:* Saldo MGS (LUNAS)
📱 *WhatsApp:* ${whatsapp}
🆔 *Data Akun:* ${accountDisplay}

Saya siap mengirimkan detail login dan screenshot bundle yang ingin dibeli.`
        );

        if (window.Swal) {
          Swal.fire({
            html: `
              <div class="mgs-modal-wrapper">
                <!-- Karakter Maskot Jempol -->
                <div class="mgs-mascot-container">
                  <div class="mgs-mascot-glow"></div>
                  <svg class="mgs-mascot-thumb" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#ccff00" stroke-width="3"/>
                    <!-- Rambut & Topi Headset Gaming -->
                    <path d="M28 42C28 28 72 28 72 42V56C72 68 60 76 50 76C40 76 28 68 28 56V42Z" fill="#0f172a"/>
                    <path d="M22 45C22 40 26 40 26 55C26 65 22 65 22 55V45Z" fill="#10b981"/>
                    <path d="M74 45C74 40 78 40 78 55C78 65 74 65 74 55V45Z" fill="#10b981"/>
                    <path d="M24 45C24 22 76 22 76 45" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
                    <!-- Wajah Tersenyum -->
                    <circle cx="42" cy="50" r="4" fill="#ccff00"/>
                    <circle cx="58" cy="50" r="4" fill="#ccff00"/>
                    <path d="M44 60Q50 67 56 60" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>
                    <!-- Tangan Kasih Jempol -->
                    <g transform="translate(62, 48)">
                      <ellipse cx="14" cy="14" rx="14" ry="14" fill="#10b981"/>
                      <path d="M12 20V12C12 9 14 7 16 7C17.5 7 19 8.5 19 10V14H21C22.5 14 23.5 15.5 23.5 17C23.5 18 22.8 19 22 19.5C22.5 20 22.5 21 22 21.8C21.5 22.5 20.5 23 19.5 23H15C13 23 12 21.5 12 20Z" fill="#fff"/>
                    </g>
                  </svg>
                  <div class="mgs-speech-bubble">MANTAP BOSQ! 👍</div>
                </div>

                <h3 class="mgs-modal-title">Pembayaran Berhasil!</h3>
                <p class="mgs-modal-sub">Saldo MGS telah dipotong untuk pesanan ini.</p>
                
                <!-- Receipt Struk -->
                <div class="mgs-receipt-card">
                  <div class="receipt-row">
                    <span>Invoice</span>
                    <strong style="color: #38bdf8; font-family: monospace;">${invoiceNumber}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Game</span>
                    <strong>${currentGame.title}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Paket</span>
                    <strong style="color: #ccff00;">${selectedItem.name}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Akun</span>
                    <strong>${accountDisplay}</strong>
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-row total">
                    <span>Total Bayar</span>
                    <strong style="color: #10b981; font-size: 1.1rem;">Rp ${totalToPay.toLocaleString("id-ID")}</strong>
                  </div>
                </div>

                <a href="https://api.whatsapp.com/send?phone=6282121616716&text=${waMsg}" class="btn-mgs-modal-wa">
                  <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> Kirim Detail ke WhatsApp
                </a>
              </div>
            `,
            background: "#090d16",
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
              popup: "mgs-custom-swal-box"
            }
          });
        } else {
          window.location.href = `https://api.whatsapp.com/send?phone=6282121616716&text=${waMsg}`;
        }
        return;
      }

      // 2. JIKA MANUAL VIA ID -> MODAL KARAKTER JEMPOL & DIRECT WA
      if (isManualIdGame) {
        const waMsgId = encodeURIComponent(
`Halo Admin MamangGS! Saya baru saja order Top Up Manual (Via ID).

📄 *Invoice:* ${invoiceNumber}
🎮 *Game:* ${currentGame.title}
💎 *Item:* ${selectedItem.name}
💰 *Total Bayar:* Rp ${totalToPay.toLocaleString("id-ID")}
💳 *Metode:* Saldo MGS (LUNAS)
📱 *WhatsApp:* ${whatsapp}
🆔 *User ID:* ${accountDisplay}

Saldo akun saya sudah berhasil dipotong. Mohon segera diproses ya min. Terima kasih!`
        );

        if (window.Swal) {
          Swal.fire({
            html: `
              <div class="mgs-modal-wrapper">
                <!-- Karakter Maskot Jempol -->
                <div class="mgs-mascot-container">
                  <div class="mgs-mascot-glow"></div>
                  <svg class="mgs-mascot-thumb" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#1e293b" stroke="#ccff00" stroke-width="3"/>
                    <!-- Rambut & Topi Headset Gaming -->
                    <path d="M28 42C28 28 72 28 72 42V56C72 68 60 76 50 76C40 76 28 68 28 56V42Z" fill="#0f172a"/>
                    <path d="M22 45C22 40 26 40 26 55C26 65 22 65 22 55V45Z" fill="#10b981"/>
                    <path d="M74 45C74 40 78 40 78 55C78 65 74 65 74 55V45Z" fill="#10b981"/>
                    <path d="M24 45C24 22 76 22 76 45" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
                    <!-- Wajah Tersenyum -->
                    <circle cx="42" cy="50" r="4" fill="#ccff00"/>
                    <circle cx="58" cy="50" r="4" fill="#ccff00"/>
                    <path d="M44 60Q50 67 56 60" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>
                    <!-- Tangan Kasih Jempol -->
                    <g transform="translate(62, 48)">
                      <ellipse cx="14" cy="14" rx="14" ry="14" fill="#10b981"/>
                      <path d="M12 20V12C12 9 14 7 16 7C17.5 7 19 8.5 19 10V14H21C22.5 14 23.5 15.5 23.5 17C23.5 18 22.8 19 22 19.5C22.5 20 22.5 21 22 21.8C21.5 22.5 20.5 23 19.5 23H15C13 23 12 21.5 12 20Z" fill="#fff"/>
                    </g>
                  </svg>
                  <div class="mgs-speech-bubble">MANTAP BOSQ! 👍</div>
                </div>

                <h3 class="mgs-modal-title">Pesanan Diterima!</h3>
                <p class="mgs-modal-sub">Saldo MGS telah dipotong. Klik tombol di bawah untuk proses cepat ke Admin.</p>
                
                <!-- Receipt Struk -->
                <div class="mgs-receipt-card">
                  <div class="receipt-row">
                    <span>Invoice</span>
                    <strong style="color: #38bdf8; font-family: monospace;">${invoiceNumber}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Game</span>
                    <strong>${currentGame.title}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Item</span>
                    <strong style="color: #ccff00;">${selectedItem.name}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>User ID</span>
                    <strong style="color: #fff;">${accountDisplay}</strong>
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-row total">
                    <span>Total Tagihan</span>
                    <strong style="color: #10b981; font-size: 1.1rem;">Rp ${totalToPay.toLocaleString("id-ID")}</strong>
                  </div>
                </div>

                <a href="https://api.whatsapp.com/send?phone=6282121616716&text=${waMsgId}" class="btn-mgs-modal-wa">
                  <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> Konfirmasi ke WhatsApp Admin
                </a>
              </div>
            `,
            background: "#090d16",
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
              popup: "mgs-custom-swal-box"
            }
          });
        } else {
          window.location.href = `https://api.whatsapp.com/send?phone=6282121616716&text=${waMsgId}`;
        }
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
      showToast("error", "Pesanan Gagal", err.message);
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = isAnyManual
        ? '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS'
        : (selectedPayment.toLowerCase().includes("saldo")
          ? '<i class="fa-solid fa-bolt"></i> Bayar Pakai Saldo MGS'
          : '<i class="fa-solid fa-bolt"></i> Beli dan Pilih Cara Pembayaran');
    }
  });
});