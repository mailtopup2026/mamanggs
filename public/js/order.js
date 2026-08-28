document.addEventListener("DOMContentLoaded", () => {
  // Database mock katalog game & nominal
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

  // Baca parameter game dari URL (?game=...)
  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get("game") || "mlbb";
  const currentGame = gamesData[gameKey] || gamesData["mlbb"];

  // Render info game sidebar
  document.getElementById("gameTitle").innerText = currentGame.title;
  document.getElementById("gameDev").innerText = currentGame.dev;
  document.getElementById("gameBanner").src = currentGame.banner;

  const zoneGroup = document.getElementById("zoneGroup");
  if (!currentGame.hasZone && zoneGroup) {
    zoneGroup.style.display = "none";
  }

  // State Pilihan User
  let selectedItem = currentGame.items[0];
  let selectedPayment = "QRIS (Semua E-Wallet)";

  // Render Pilihan Nominal
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
    });
    nominalContainer.appendChild(card);
  });

  // Pilih Metode Pembayaran
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const spanTitle = card.querySelector(".payment-brand span");
      if (spanTitle) selectedPayment = spanTitle.innerText;
    });
  });

  // Handle Checkout & Simpan ke Supabase
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.addEventListener("click", async () => {
    const userId = document.getElementById("userIdInput").value.trim();
    const zoneId = currentGame.hasZone ? document.getElementById("zoneIdInput").value.trim() : null;
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
      alert("Harap masukkan nomor WhatsApp aktif untuk konfirmasi invoice!");
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Pesanan...';

    // Buat nomor invoice unik (Contoh: MGS-2026-98124)
    const now = new Date();
    const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `MGS-${dateStr}-${randomDigits}`;

    // Cek apakah pembeli sedang login
    let userUuid = null;
    const storedUser = localStorage.getItem("mgs_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        userUuid = u.id || null;
      } catch (e) {}
    }

    try {
      if (!window.supabase) throw new Error("Koneksi Supabase belum siap. Silakan refresh halaman.");

      // Simpan data order ke tabel orders Supabase
      const { error } = await window.supabase.from("orders").insert([
        {
          invoice: invoiceNumber,
          user_id: userUuid,
          game_code: currentGame.code,
          game_title: currentGame.title,
          account_id: userId,
          zone_id: zoneId,
          item_name: selectedItem.name,
          price: selectedItem.price,
          payment_method: selectedPayment,
          whatsapp: whatsapp,
          status: "PENDING"
        }
      ]);

      if (error) throw error;

      // Alihkan pembeli ke halaman status order dengan membawa invoice
      window.location.href = `/order-status.html?inv=${encodeURIComponent(invoiceNumber)}`;
    } catch (err) {
      console.error(err);
      alert("Gagal membuat pesanan: " + err.message);
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Beli Sekarang';
    }
  });
});