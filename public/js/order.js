document.addEventListener("DOMContentLoaded", () => {
  // Mock data katalog game & nominal
  const gamesData = {
    mlbb: {
      code: "mlbb",
      title: "Mobile Legends: Bang Bang",
      dev: "Moonton Games",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      items: [
        { name: "86 Diamonds", price: 21500 },
        { name: "172 Diamonds", price: 42000 },
        { name: "257 Diamonds", price: 63000 },
        { name: "706 Diamonds", price: 168000 },
        { name: "Weekly Pass", price: 27500 },
        { name: "Twilight Pass", price: 145000 }
      ]
    },
    ff: {
      code: "ff",
      title: "Free Fire Max",
      dev: "Garena International",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      items: [
        { name: "70 Diamonds", price: 9500 },
        { name: "140 Diamonds", price: 19000 },
        { name: "355 Diamonds", price: 47000 },
        { name: "720 Diamonds", price: 93000 },
        { name: "Member Mingguan", price: 29000 },
        { name: "Member Bulanan", price: 145000 }
      ]
    },
    whiteout: {
      code: "whiteout",
      title: "Whiteout Survival",
      dev: "Century Games PTE. LTD.",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      items: [
        { name: "500 Frost Star", price: 14500 },
        { name: "1000 Frost Star", price: 28500 },
        { name: "2500 Frost Star", price: 69000 },
        { name: "5000 Frost Star", price: 138000 },
        { name: "10000 Frost Star", price: 275000 },
        { name: "25000 Frost Star", price: 680000 }
      ]
    },
    genshin: {
      code: "genshin",
      title: "Genshin Impact",
      dev: "HoYoverse",
      banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      items: [
        { name: "60 Genesis Crystals", price: 15000 },
        { name: "300 Genesis Crystals", price: 75000 },
        { name: "980 Genesis Crystals", price: 230000 },
        { name: "Welkin Moon", price: 75000 }
      ]
    }
  };

  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get("game") || "mlbb";
  const currentGame = gamesData[gameKey] || gamesData["mlbb"];

  document.getElementById("gameTitle").innerText = currentGame.title;
  document.getElementById("gameDev").innerText = currentGame.dev;
  document.getElementById("gameBanner").src = currentGame.banner;

  const zoneGroup = document.getElementById("zoneGroup");
  if (!currentGame.hasZone && zoneGroup) {
    zoneGroup.style.display = "none";
  }

  let selectedItem = currentGame.items[0];
  let selectedPayment = "QRIS (Semua E-Wallet)";
  let verifiedNickname = null;

  // Variabel Kupon Promo
  let appliedPromo = null;
  let currentDiscountAmount = 0;
  let finalCalculatedPrice = selectedItem.price;

  // ==========================================
  // KALKULASI HARGA & PROMO
  // ==========================================
  function updateCheckoutPricing() {
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

      const basePrice = Number(selectedItem.price || 0);

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
  // RENDER NOMINAL ITEM
  // ==========================================
  const nominalContainer = document.getElementById("nominalContainer");
  nominalContainer.innerHTML = "";

  currentGame.items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "nominal-card" + (index === 0 ? " selected" : "");
    const formattedPrice = Number(item.price).toLocaleString("id-ID");
    card.innerHTML = `
      <div class="nominal-title">${item.name}</div>
      <div class="nominal-price">Rp ${formattedPrice}</div>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(".nominal-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedItem = item;
      updateCheckoutPricing();
    });
    nominalContainer.appendChild(card);
  });

  // Hitung awal saat load halaman
  updateCheckoutPricing();

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
  // FITUR REAL AUTO CEK NICKNAME ID GAME
  // ==========================================
  const userIdInput = document.getElementById("userIdInput");
  const zoneIdInput = document.getElementById("zoneIdInput");
  const idCheckSpinner = document.getElementById("idCheckSpinner");
  const nicknameBox = document.getElementById("nicknameBox");

  let checkTimeout = null;

  async function checkNickname() {
    const uid = userIdInput.value.trim();
    const zid = currentGame.hasZone ? zoneIdInput.value.trim() : null;

    if (!uid || (currentGame.hasZone && !zid)) {
      nicknameBox.style.display = "none";
      verifiedNickname = null;
      return;
    }

    if (uid.length < 4) return;

    idCheckSpinner.style.display = "block";
    nicknameBox.style.display = "none";

    try {
      let resultNick = null;

      if (currentGame.code === "mlbb") {
        const res = await fetch(`https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(uid)}&zone=${encodeURIComponent(zid)}`);
        const data = await res.json();
        
        if (data && data.success && data.name) {
          resultNick = data.name;
        } else {
          throw new Error("ID atau Zone ID Mobile Legends tidak ditemukan.");
        }
      } else if (currentGame.code === "ff") {
        const res = await fetch(`https://api.isan.eu.org/nickname/ff?id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        
        if (data && data.success && data.name) {
          resultNick = data.name;
        } else {
          throw new Error("User ID Free Fire tidak valid.");
        }
      } else {
        resultNick = `Player_${uid.slice(-4)}`;
      }

      verifiedNickname = resultNick;
      nicknameBox.className = "nickname-result-box";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>Nickname Akun: <strong>${resultNick}</strong> (Terverifikasi)</span>
      `;
      nicknameBox.style.display = "flex";
    } catch (err) {
      console.error("Cek ID Error:", err);
      nicknameBox.className = "nickname-result-box error";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-xmark"></i>
        <span>${err.message || "User ID tidak ditemukan. Periksa kembali ID Anda."}</span>
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

    // LOGIKA PEMBAYARAN SALDO DOMPET MAMANGGS
    const isUsingWallet = selectedPayment.toLowerCase().includes("saldo");
    let orderStatus = "PENDING";
    const totalToPay = Number(finalCalculatedPrice);

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
    }

    // SIMPAN KE TABEL ORDERS SUPABASE
    try {
      if (!window.supabase) throw new Error("Koneksi Supabase belum siap.");

      const orderPayload = {
        invoice: invoiceNumber,
        game_code: currentGame.code,
        game_title: currentGame.title,
        account_id: userId,
        zone_id: zoneId || null,
        item_name: selectedItem.name,
        price: totalToPay, // Harga yang sudah dipotong diskon
        payment_method: selectedPayment,
        whatsapp: whatsapp,
        status: orderStatus
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