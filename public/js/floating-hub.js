document.addEventListener("DOMContentLoaded", () => {
  // 1. Hapus elemen hub lama jika ada
  const oldHub = document.querySelector(".floating-hub-container");
  if (oldHub) oldHub.remove();

  // 2. Suntikkan CSS Override Kuat (Anti-Bentrok)
  const styleEl = document.createElement("style");
  styleEl.id = "floating-hub-force-styles";
  styleEl.innerHTML = `
    .floating-hub-container {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 999999 !important;
      display: flex !important;
      flex-direction: column-reverse !important;
      align-items: center !important;
      gap: 12px !important;
      width: 56px !important;
      height: auto !important;
      user-select: none !important;
    }

    .btn-hub-main {
      width: 56px !important;
      height: 56px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border: none !important;
      color: #ffffff !important;
      font-size: 1.4rem !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45) !important;
      transition: all 0.25s ease !important;
      flex-shrink: 0 !important;
    }

    .btn-hub-main:hover {
      transform: scale(1.08) !important;
    }

    .floating-hub-container.active .btn-hub-main {
      background: #ef4444 !important;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45) !important;
      transform: rotate(90deg) !important;
    }

    .hub-menu-items {
      display: flex !important;
      flex-direction: column-reverse !important;
      align-items: center !important;
      gap: 10px !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      transform: translateY(15px) !important;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .floating-hub-container.active .hub-menu-items {
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      transform: translateY(0) !important;
    }

    .hub-radial-item {
      position: relative !important;
      width: 46px !important;
      height: 46px !important;
      border-radius: 50% !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 1.25rem !important;
      text-decoration: none !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
      transition: transform 0.2s ease, filter 0.2s ease !important;
      flex-shrink: 0 !important;
    }

    .hub-radial-item:hover {
      transform: scale(1.1) !important;
      filter: brightness(1.2) !important;
    }

    .hub-radial-item.whatsapp {
      background: #25d366 !important;
    }

    .hub-radial-item.tiktok {
      background: #000000 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    .hub-radial-item.instagram {
      background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%) !important;
    }

    .hub-tooltip {
      position: absolute !important;
      right: 56px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      background: rgba(15, 23, 42, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      font-size: 0.72rem !important;
      font-weight: 700 !important;
      padding: 4px 10px !important;
      border-radius: 6px !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      opacity: 0 !important;
      transition: opacity 0.15s ease !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    }

    .hub-radial-item:hover .hub-tooltip {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(styleEl);

  // 3. Buat Elemen DOM Baru
  const hubContainer = document.createElement("div");
  hubContainer.className = "floating-hub-container";
  hubContainer.innerHTML = `
    <!-- Tombol Utama Pemicu -->
    <button class="btn-hub-main" id="btnHubToggle" title="Bantuan & Medsos" type="button">
      <i class="fa-solid fa-headset"></i>
    </button>

    <!-- Menu Melayang ke Atas (Stack) -->
    <div class="hub-menu-items">
      <!-- Item 1: WhatsApp -->
      <a href="https://wa.me/6281234567890" target="_blank" class="hub-radial-item whatsapp" title="WhatsApp CS">
        <i class="fa-brands fa-whatsapp"></i>
        <span class="hub-tooltip">WhatsApp CS</span>
      </a>

      <!-- Item 2: TikTok -->
      <a href="https://tiktok.com/@mamanggs" target="_blank" class="hub-radial-item tiktok" title="TikTok">
        <i class="fa-brands fa-tiktok"></i>
        <span class="hub-tooltip">TikTok Official</span>
      </a>

      <!-- Item 3: Instagram -->
      <a href="https://instagram.com/mamanggs" target="_blank" class="hub-radial-item instagram" title="Instagram">
        <i class="fa-brands fa-instagram"></i>
        <span class="hub-tooltip">Instagram</span>
      </a>
    </div>
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

  // Tutup otomatis jika klik area luar
  document.addEventListener("click", (e) => {
    if (hubContainer && !hubContainer.contains(e.target)) {
      if (hubContainer.classList.contains("active")) {
        hubContainer.classList.remove("active");
        if (btnToggle) btnToggle.innerHTML = `<i class="fa-solid fa-headset"></i>`;
      }
    }
  });
});