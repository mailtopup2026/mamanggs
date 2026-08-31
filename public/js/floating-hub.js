document.addEventListener("DOMContentLoaded", () => {
  // Hapus container lama jika ada
  const oldHub = document.querySelector(".floating-hub-container");
  if (oldHub) oldHub.remove();

  // Injeksi CSS Khusus Floating Hub agar tidak lari/menghindar saat di-hover
  const styleEl = document.createElement("style");
  styleEl.id = "floating-hub-styles";
  styleEl.innerHTML = `
    .floating-hub-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      width: 56px;
      height: 56px;
      user-select: none;
    }

    .btn-hub-main {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: #fff;
      font-size: 1.4rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      position: relative;
      z-index: 2;
      transition: transform 0.25s ease, background 0.25s ease;
    }

    .btn-hub-main:hover {
      transform: scale(1.05);
    }

    .floating-hub-container.active .btn-hub-main {
      background: #ef4444;
      transform: rotate(90deg);
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    }

    .hub-radial-item {
      position: absolute;
      top: 0;
      left: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      text-decoration: none;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      opacity: 0;
      pointer-events: none;
      transform: translate(0, 0) scale(0.4);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      z-index: 1;
    }

    /* Posisi saat AKTIF (Diam & Tidak Bergerak Liar) */
    .floating-hub-container.active .hub-radial-item {
      opacity: 1;
      pointer-events: auto;
    }

    /* 1. WhatsApp (Geser ke Kiri: -70px) */
    .floating-hub-container.active .hub-radial-item.whatsapp {
      transform: translate(-68px, 4px) scale(1);
      background: #25d366;
    }

    /* 2. TikTok (Geser ke Serong Kiri Atas: -50px, -60px) */
    .floating-hub-container.active .hub-radial-item.tiktok {
      transform: translate(-50px, -60px) scale(1);
      background: #000000;
      border: 1px solid rgba(255,255,255,0.2);
    }

    /* 3. Instagram (Geser ke Atas: 4px, -70px) */
    .floating-hub-container.active .hub-radial-item.instagram {
      transform: translate(4px, -70px) scale(1);
      background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
    }

    /* Hover efek hanya menambah sedikit terang tanpa merubah posisi koordinat */
    .hub-radial-item:hover {
      filter: brightness(1.15);
    }

    /* Tooltip Anti-Tabrak */
    .hub-tooltip {
      position: absolute;
      bottom: -24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none; /* Mencegah tooltip memblokir klik kursor */
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .hub-radial-item:hover .hub-tooltip {
      opacity: 1;
    }
  `;
  document.head.appendChild(styleEl);

  // Buat Hub Container
  const hubContainer = document.createElement("div");
  hubContainer.className = "floating-hub-container";
  hubContainer.innerHTML = `
    <a href="https://wa.me/6281234567890" target="_blank" class="hub-radial-item whatsapp" title="WhatsApp CS">
      <i class="fa-brands fa-whatsapp"></i>
      <span class="hub-tooltip">WhatsApp</span>
    </a>

    <a href="https://tiktok.com/@mamanggs" target="_blank" class="hub-radial-item tiktok" title="TikTok">
      <i class="fa-brands fa-tiktok"></i>
      <span class="hub-tooltip">TikTok</span>
    </a>

    <a href="https://instagram.com/mamanggs" target="_blank" class="hub-radial-item instagram" title="Instagram">
      <i class="fa-brands fa-instagram"></i>
      <span class="hub-tooltip">Instagram</span>
    </a>

    <button class="btn-hub-main" id="btnHubToggle" title="Bantuan & Medsos" type="button">
      <i class="fa-solid fa-headset"></i>
    </button>
  `;

  document.body.appendChild(hubContainer);

  const btnToggle = hubContainer.querySelector("#btnHubToggle");
  if (btnToggle) {
    btnToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = hubContainer.classList.toggle("active");
      btnToggle.innerHTML = isActive 
        ? `<i class="fa-solid fa-xmark"></i>` 
        : `<i class="fa-solid fa-headset"></i>`;
    });
  }

  // Tutup otomatis jika klik di luar
  document.addEventListener("click", (e) => {
    if (hubContainer && !hubContainer.contains(e.target)) {
      if (hubContainer.classList.contains("active")) {
        hubContainer.classList.remove("active");
        if (btnToggle) btnToggle.innerHTML = `<i class="fa-solid fa-headset"></i>`;
      }
    }
  });
});