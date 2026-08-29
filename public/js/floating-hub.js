document.addEventListener("DOMContentLoaded", () => {
  // Hapus container lama jika ada
  const oldHub = document.querySelector(".floating-hub-container");
  if (oldHub) oldHub.remove();

  // Buat Hub Circle Radial baru
  const hubContainer = document.createElement("div");
  hubContainer.className = "floating-hub-container";
  hubContainer.innerHTML = `
    <!-- Item 1: WhatsApp (Kiri) -->
    <a href="https://wa.me/6281234567890" target="_blank" class="hub-radial-item whatsapp" title="WhatsApp CS">
      <i class="fa-brands fa-whatsapp"></i>
      <span class="hub-tooltip">WhatsApp</span>
    </a>

    <!-- Item 2: TikTok (Serong Kiri Atas) -->
    <a href="https://tiktok.com/@mamanggs" target="_blank" class="hub-radial-item tiktok" title="TikTok">
      <i class="fa-brands fa-tiktok"></i>
      <span class="hub-tooltip">TikTok</span>
    </a>

    <!-- Item 3: Instagram (Atas) -->
    <a href="https://instagram.com/mamanggs" target="_blank" class="hub-radial-item instagram" title="Instagram">
      <i class="fa-brands fa-instagram"></i>
      <span class="hub-tooltip">Instagram</span>
    </a>

    <!-- Tombol Utama Pemicu -->
    <button class="btn-hub-main" id="btnHubToggle" title="Bantuan & Medsos">
      <i class="fa-solid fa-headset"></i>
    </button>
  `;

  document.body.appendChild(hubContainer);

  const btnToggle = hubContainer.querySelector("#btnHubToggle");
  if (btnToggle) {
    btnToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      hubContainer.classList.toggle("active");
    });
  }

  // Tutup otomatis jika klik di luar
  document.addEventListener("click", (e) => {
    if (hubContainer && !hubContainer.contains(e.target)) {
      hubContainer.classList.remove("active");
    }
  });
});