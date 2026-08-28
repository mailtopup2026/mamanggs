document.addEventListener("DOMContentLoaded", () => {
  // Database mock produk game
  const gamesData = {
    mlbb: {
      title: "Mobile Legends: Bang Bang",
      dev: "Moonton Games",
      banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      items: [
        { name: "86 Diamonds", price: "Rp 21.500" },
        { name: "172 Diamonds", price: "Rp 42.000" },
        { name: "257 Diamonds", price: "Rp 63.000" },
        { name: "706 Diamonds", price: "Rp 168.000" },
        { name: "Weekly Pass", price: "Rp 27.500" },
        { name: "Twilight Pass", price: "Rp 145.000" }
      ]
    },
    ff: {
      title: "Free Fire Max",
      dev: "Garena International",
      banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      items: [
        { name: "70 Diamonds", price: "Rp 9.500" },
        { name: "140 Diamonds", price: "Rp 19.000" },
        { name: "355 Diamonds", price: "Rp 47.000" },
        { name: "720 Diamonds", price: "Rp 93.000" },
        { name: "Member Mingguan", price: "Rp 29.000" },
        { name: "Member Bulanan", price: "Rp 145.000" }
      ]
    },
    whiteout: {
      title: "Whiteout Survival",
      dev: "Century Games PTE. LTD.",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      hasZone: false,
      items: [
        { name: "500 Frost Star", price: "Rp 14.500" },
        { name: "1000 Frost Star", price: "Rp 28.500" },
        { name: "2500 Frost Star", price: "Rp 69.000" },
        { name: "5000 Frost Star", price: "Rp 138.000" },
        { name: "10000 Frost Star", price: "Rp 275.000" },
        { name: "25000 Frost Star", price: "Rp 680.000" }
      ]
    },
    genshin: {
      title: "Genshin Impact",
      dev: "HoYoverse",
      banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      hasZone: true,
      items: [
        { name: "60 Genesis Crystals", price: "Rp 15.000" },
        { name: "300 Genesis Crystals", price: "Rp 75.000" },
        { name: "980 Genesis Crystals", price: "Rp 230.000" },
        { name: "Welkin Moon", price: "Rp 75.000" }
      ]
    }
  };

  // Baca parameter URL (?game=...)
  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get("game") || "mlbb";
  const currentGame = gamesData[gameKey] || gamesData["mlbb"];

  // Isi data sidebar
  document.getElementById("gameTitle").innerText = currentGame.title;
  document.getElementById("gameDev").innerText = currentGame.dev;
  document.getElementById("gameBanner").src = currentGame.banner;

  // Atur Zone ID input jika tidak dibutuhkan
  const zoneGroup = document.getElementById("zoneGroup");
  if (!currentGame.hasZone && zoneGroup) {
    zoneGroup.style.display = "none";
  }

  // Render list nominal
  const nominalContainer = document.getElementById("nominalContainer");
  nominalContainer.innerHTML = "";

  currentGame.items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "nominal-card" + (index === 0 ? " selected" : "");
    card.innerHTML = `
      <div class="nominal-title">${item.name}</div>
      <div class="nominal-price">${item.price}</div>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(".nominal-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
    });
    nominalContainer.appendChild(card);
  });

  // Pilih Metode Pembayaran
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
    });
  });

  // Handle Checkout / Buat Pesanan
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const userId = document.getElementById("userIdInput").value.trim();
    const whatsapp = document.getElementById("whatsappInput").value.trim();

    if (!userId) {
      alert("Harap masukkan User ID akun game kamu!");
      return;
    }
    if (!whatsapp) {
      alert("Harap masukkan nomor WhatsApp aktif untuk konfirmasi invoice!");
      return;
    }

    // Generate kode invoice acak
    const randomInv = "MGS-" + Math.floor(100000 + Math.random() * 900000);
    alert(`Pesanan ${currentGame.title} Berhasil Dibuat!\nInvoice: ${randomInv}\nMenuju halaman status transaksi...`);
    window.location.href = `/order-status.html?inv=${randomInv}`;
  });
});