document.addEventListener("DOMContentLoaded", async () => {
  // 1. DAFTAR LENGKAP METADATA GAME
  const gamesMeta = {
    mlbb: {
      code: "mlbb",
      brandQuery: "MOBILE LEGEND",
      title: "Mobile Legends: Bang Bang",
      dev: "Moonton Games",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: true
    },
    ff: {
      code: "ff",
      brandQuery: "FREE FIRE",
      title: "Free Fire Max",
      dev: "Garena International",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: false
    },
    pubg: {
      code: "pubg",
      brandQuery: "PUBG",
      title: "PUBG Mobile | UC",
      dev: "Level Infinite",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false
    },
    genshin: {
      code: "genshin",
      brandQuery: "GENSHIN",
      title: "Genshin Impact",
      dev: "HoYoverse",
      banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      hasZone: true
    },
    valorant: {
      code: "valorant",
      brandQuery: "VALORANT",
      title: "Valorant Points",
      dev: "Riot Games",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false
    },
    hok: {
      code: "hok",
      brandQuery: "HONOR OF KINGS",
      title: "Honor of Kings",
      dev: "Level Infinite",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: false
    },
    whiteout: {
      code: "whiteout",
      brandQuery: "WHITEOUT",
      title: "Whiteout Survival",
      dev: "Century Games PTE. LTD.",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false
    }
  };

  const params = new URLSearchParams(window.location.search);
  const gameKey = (params.get("game") || "mlbb").toLowerCase();
  const currentGame = gamesMeta[gameKey] || gamesMeta["mlbb"];

  // Set Info Game di UI
  if (document.getElementById("gameTitle")) document.getElementById("gameTitle").innerText = currentGame.title;
  if (document.getElementById("gameDev")) document.getElementById("gameDev").innerText = currentGame.dev;
  if (document.getElementById("gameBanner")) document.getElementById("gameBanner").src = currentGame.banner;

  const zoneGroup = document.getElementById("zoneGroup");
  if (!currentGame.hasZone && zoneGroup) {
    zoneGroup.style.display = "none";
  }

  let selectedItem = null;
  let selectedPayment = "QRIS (Semua E-Wallet)";
  let verifiedNickname = null;

  // Variabel Kupon Promo
  let appliedPromo = null;
  let currentDiscountAmount = 0;
  let finalCalculatedPrice = 0;

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

  // Listener Klaim Voucher Promo
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
  // AMBIL & RENDER NOMINAL DARI SUPABASE (REAL DATA)
  // ==========================================
  const nominalContainer = document.getElementById("nominalContainer");
  nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat nominal dari database...</div>`;

  try {
    const { data: dbProducts, error: dbError } = await window.supabase
      .from("products")
      .select("*")
      .eq("game_code", currentGame.code)
      .eq("buyer_product_status", true)
      .order("price_sell", { ascending: true });

    if (dbError) throw dbError;

    if (!dbProducts || dbProducts.length === 0) {
      nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Produk game ini belum tersedia di katalog.</div>`;
    } else {
      nominalContainer.innerHTML = "";

      dbProducts.forEach((prod, index) => {
        const itemObj = {
          sku: prod.buyer_sku_code,
          name: prod.product_name,
          price: Number(prod.price_sell)
        };

        if (index === 0) {
          selectedItem = itemObj;
        }

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
    nominalContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #e63946; padding: 20px;">Gagal memuat produk game.</div>`;
  }

  // Handle Pilih Metode Bayar
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const spanTitle = card.querySelector(".payment-brand span");
      if (spanTitle) selectedPayment = spanTitle.innerText.trim();
    });
  });

  // ==========================================
  // FITUR AUTO CEK NICKNAME VIA SERVERLESS PROXY
  // ==========================================
  const userIdInput = document.getElementById("userIdInput");
  const zoneIdInput = document.getElementById("zoneIdInput");
  const idCheckSpinner = document.getElementById("idCheckSpinner");
  const nicknameBox = document.getElementById("nicknameBox");

  let checkTimeout = null;

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
      const queryParams = new URLSearchParams({
        game: currentGame.code,
        id: uid,
        zone: zid
      });

      const res = await fetch(`/api/check-id?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "User ID / Server tidak ditemukan.");
      }

      verifiedNickname = data.name;
      nicknameBox.className = "nickname-result-box";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>Nickname Akun: <strong>${data.name}</strong> (Terverifikasi)</span>
      `;
      nicknameBox.style.display = "flex";
    } catch (err) {
      console.error("Cek ID Error:", err);
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

  // ==========================================
  // CHECKOUT HANDLER
  // ==========================================
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.addEventListener("click", async () => {
    const userId = userIdInput.value.trim();
    const zoneId = currentGame.hasZone ? zoneIdInput.value.trim() : null;
    const whatsapp = document.getElementById("whatsappInput").value.trim();

    if (!selectedItem) {
      alert("Harap pilih salah satu nominal produk!");
      return;
    }
    if (!userId) {
      alert("Harap masukkan User ID akun game kamu!");
      return;
    }
    if (currentGame.hasZone && !zoneId) {
      alert("Harap masukkan Zone ID / Server game kamu!");
      return;
    }
    if (!whatsapp) {
      alert("Harap masukkan nomor WhatsApp aktif!");
      return;
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
        if (sessionData?.session?.user?.id) {
          userUuid = sessionData.session.user.id;
        }
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

    // 1. PEMBAYARAN MENGGUNAKAN SALDO INTERNAL MAMANGGS
    if (isUsingWallet) {
      if (!userUuid) {
        alert("Metode pembayaran Saldo Akun hanya berlaku untuk member yang sudah login. Silakan Login terlebih dahulu!");
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
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
          alert(`Saldo Akun Anda tidak mencukupi!\nSaldo Anda: Rp ${currentBal.toLocaleString("id-ID")}\nTotal Bayar: Rp ${totalToPay.toLocaleString("id-ID")}\n\nSilakan isi saldo akun Anda terlebih dahulu.`);
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
          return;
        }

        const { data: deductSuccess, error: deductErr } = await window.supabase.rpc("deduct_user_balance", {
          user_uuid: userUuid,
          amount: totalToPay
        });

        if (deductErr || !deductSuccess) {
          throw new Error("Gagal memproses pemotongan saldo. Silakan coba lagi.");
        }

        orderStatus = "SUCCESS";
      } catch (err) {
        console.error("Wallet error:", err);
        alert(err.message);
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
        return;
      }
    } else {
      // 2. PEMBAYARAN MENGGUNAKAN DOKU PAYMENT GATEWAY (QRIS / VA)
      try {
        const dokuRes = await fetch("/api/create-payment.js", {
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

        if (!dokuRes.ok || !dokuResult.success) {
          throw new Error(dokuResult.error || "Gagal membuat tagihan DOKU.");
        }

        dokuPaymentData = dokuResult.data;
      } catch (err) {
        console.error("DOKU Gateway Error:", err);
        alert(`Gagal memproses gateway pembayaran: ${err.message}`);
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
        return;
      }
    }

    // 3. SIMPAN PESANAN KE SUPABASE
    try {
      if (!window.supabase) throw new Error("Koneksi Supabase belum siap.");

      const orderPayload = {
        invoice: invoiceNumber,
        game_code: currentGame.code,
        game_title: currentGame.title,
        account_id: userId,
        zone_id: zoneId || null,
        item_name: selectedItem.name,
        price: totalToPay,
        payment_method: selectedPayment,
        whatsapp: whatsapp,
        status: orderStatus,
        payment_data: dokuPaymentData || null
      };

      if (userUuid) {
        orderPayload.user_id = userUuid;
      }

      const { error } = await window.supabase.from("orders").insert([orderPayload]);
      if (error) throw error;

      if (isUsingWallet) {
        alert("Pembayaran Berhasil! Saldo akun Anda telah dipotong dan pesanan langsung diproses.");
      }

      window.location.href = `/order-status.html?inv=${encodeURIComponent(invoiceNumber)}`;
    } catch (err) {
      console.error("Error order:", err);
      alert("Gagal membuat pesanan: " + err.message);
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
    }
  });
});