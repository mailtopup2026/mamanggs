document.addEventListener("DOMContentLoaded", () => {
  // Konfigurasi Media Sosial Resmi MamangGS
  const SOCIAL_CONFIG = {
    whatsapp_number: "6282121616716",
    default_text: "Halo Min, saya mau tanya seputar top up game di MamangGS...",
    tiktok_url: "https://www.tiktok.com/@arthurwos?_r=1&_t=ZS-99GSX8AEZs4",
    instagram_url: "https://www.instagram.com/arthur.wos?igsi=ZG4zODZyeXh6YXg5"
  };

  const waLink = `https://wa.me/${SOCIAL_CONFIG.whatsapp_number}?text=${encodeURIComponent(SOCIAL_CONFIG.default_text)}`;

  // Inject Floating Social Hub ke halaman
  const hubHtml = `
    <div class="floating-hub-container" id="floatingHub">
      <button class="btn-hub-main" id="btnHubToggle" title="Hubungi CS & Media Sosial">
        <i class="fa-solid fa-comments hub-icon-main"></i>
      </button>

      <div class="hub-menu-list">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="hub-menu-item whatsapp">
          <div class="hub-icon-circle"><i class="fa-brands fa-whatsapp"></i></div>
          <span>WhatsApp CS</span>
        </a>
        <a href="${SOCIAL_CONFIG.tiktok_url}" target="_blank" rel="noopener noreferrer" class="hub-menu-item tiktok">
          <div class="hub-icon-circle"><i class="fa-brands fa-tiktok"></i></div>
          <span>TikTok MamangGS</span>
        </a>
        <a href="${SOCIAL_CONFIG.instagram_url}" target="_blank" rel="noopener noreferrer" class="hub-menu-item instagram">
          <div class="hub-icon-circle"><i class="fa-brands fa-instagram"></i></div>
          <span>Instagram Resmi</span>
        </a>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", hubHtml);

  // Toggle buka / tutup menu floating
  const floatingHub = document.getElementById("floatingHub");
  const btnHubToggle = document.getElementById("btnHubToggle");

  btnHubToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    floatingHub.classList.toggle("active");
  });

  // Tutup popup jika mengklik area luar
  document.addEventListener("click", (e) => {
    if (!floatingHub.contains(e.target)) {
      floatingHub.classList.remove("active");
    }
  });
});