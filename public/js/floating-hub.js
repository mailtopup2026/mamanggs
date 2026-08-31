document.addEventListener("DOMContentLoaded", () => {
  // 1. Bersihkan elemen lama
  document.querySelectorAll(".floating-hub-container, .mgs-float-hub").forEach(el => el.remove());

  // 2. Suntikkan CSS Khusus dengan Class Baru (Anti Bentrok dengan CSS lama)
  const styleEl = document.createElement("style");
  styleEl.id = "mgs-float-hub-styles";
  styleEl.innerHTML = `
    .mgs-float-hub {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 56px !important;
      height: 56px !important;
      z-index: 999999 !important;
      user-select: none !important;
    }

    /* Tombol Utama (Pemicu) */
    .mgs-hub-trigger {
      position: absolute !important;
      inset: 0 !important;
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
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
      z-index: 10 !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      outline: none !important;
    }

    .mgs-hub-trigger:hover {
      transform: scale(1.06) !important;
    }

    .mgs-float-hub.open .mgs-hub-trigger {
      background: #ef4444 !important;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45) !important;
      transform: rotate(90deg) !important;
    }

    /* Tombol-tombol Medsos */
    .mgs-hub-btn {
      position: absolute !important;
      top: 6px !important;
      left: 6px !important;
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 1.2rem !important;
      text-decoration: none !important;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35) !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translate(0, 0) scale(0.3) !important;
      transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, filter 0.15s ease !important;
      z-index: 5 !important;
    }

    .mgs-hub-btn:hover {
      filter: brightness(1.15) !important;
    }

    /* Posisi Rapi Melengkung di Sebelah Kiri-Atas (Pas & Nyaman Dilihat) */
    .mgs-float-hub.open .mgs-hub-btn {
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    /* 1. WhatsApp (Lurus ke Kiri: 62px) */
    .mgs-float-hub.open .mgs-hub-btn.wa {
      transform: translate(-62px, 0) scale(1) !important;
      background: #25d366 !important;
    }

    /* 2. TikTok (Serong Kiri-Atas: -46px, -46px) */
    .mgs-float-hub.open .mgs-hub-btn.tt {
      transform: translate(-46px, -46px) scale(1) !important;
      background: #000000 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    /* 3. Instagram (Lurus ke Atas: 0, -62px) */
    .mgs-float-hub.open .mgs-hub-btn.ig {
      transform: translate(0, -62px) scale(1) !important;
      background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%) !important;
    }

    /* Tooltip */
    .mgs-hub-tip {
      position: absolute !important;
      right: 52px !important;
      background: rgba(15, 23, 42, 0.92) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      font-size: 0.72rem !important;
      font-weight: 700 !important;
      padding: 3px 8px !important;
      border-radius: 5px !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      opacity: 0 !important;
      transition: opacity 0.15s ease !important;
    }

    .mgs-hub-btn:hover .mgs-hub-tip {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(styleEl);

  // 3. Render Elemen Baru
  const hub = document.createElement("div");
  hub.className = "mgs-float-hub";
  hub.innerHTML = `
    <!-- Tombol 1: WhatsApp -->
    <a href="https://wa.me/6281234567890" target="_blank" class="mgs-hub-btn wa" title="WhatsApp CS">
      <i class="fa-brands fa-whatsapp"></i>
      <span class="mgs-hub-tip">WhatsApp CS</span>
    </a>

    <!-- Tombol 2: TikTok -->
    <a href="https://tiktok.com/@mamanggs" target="_blank" class="mgs-hub-btn tt" title="TikTok">
      <i class="fa-brands fa-tiktok"></i>
      <span class="mgs-hub-tip">TikTok</span>
    </a>

    <!-- Tombol 3: Instagram -->
    <a href="https://instagram.com/mamanggs" target="_blank" class="mgs-hub-btn ig" title="Instagram">
      <i class="fa-brands fa-instagram"></i>
      <span class="mgs-hub-tip">Instagram</span>
    </a>

    <!-- Tombol Utama -->
    <button class="mgs-hub-trigger" id="mgsHubTrigger" type="button" title="Bantuan & Medsos">
      <i class="fa-solid fa-headset"></i>
    </button>
  `;

  document.body.appendChild(hub);

  // 4. Logika Buka / Tutup Klik
  const trigger = hub.querySelector("#mgsHubTrigger");
  if (trigger) {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = hub.classList.toggle("open");
      trigger.innerHTML = isOpen 
        ? `<i class="fa-solid fa-xmark"></i>` 
        : `<i class="fa-solid fa-headset"></i>`;
    });
  }

  // Tutup jika klik area di luar
  document.addEventListener("click", (e) => {
    if (hub && !hub.contains(e.target)) {
      if (hub.classList.contains("open")) {
        hub.classList.remove("open");
        if (trigger) trigger.innerHTML = `<i class="fa-solid fa-headset"></i>`;
      }
    }
  });
});