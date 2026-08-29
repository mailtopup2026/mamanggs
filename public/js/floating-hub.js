document.addEventListener("DOMContentLoaded", () => {
  // Buat Container jika belum ada di DOM
  let hubContainer = document.querySelector(".floating-hub-container");
  if (!hubContainer) {
    hubContainer = document.createElement("div");
    hubContainer.className = "floating-hub-container";
    hubContainer.innerHTML = `
      <div class="hub-menu-list">
        <a href="https://wa.me/6281234567890" target="_blank" class="hub-menu-item whatsapp">
          <span>WhatsApp CS</span>
          <div class="hub-icon-circle"><i class="fa-brands fa-whatsapp"></i></div>
        </a>
        <a href="https://tiktok.com/@mamanggs" target="_blank" class="hub-menu-item tiktok">
          <span>TikTok MamangGS</span>
          <div class="hub-icon-circle"><i class="fa-brands fa-tiktok"></i></div>
        </a>
        <a href="https://instagram.com/mamanggs" target="_blank" class="hub-menu-item instagram">
          <span>Instagram Resmi</span>
          <div class="hub-icon-circle"><i class="fa-brands fa-instagram"></i></div>
        </a>
      </div>
      <button class="btn-hub-main" id="btnHubToggle" title="Hubungi Kami">
        <i class="fa-solid fa-headset hub-icon-main"></i>
      </button>
    `;
    document.body.appendChild(hubContainer);
  }

  const btnToggle = document.getElementById("btnHubToggle");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      hubContainer.classList.toggle("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (hubContainer && !hubContainer.contains(e.target)) {
      hubContainer.classList.remove("active");
    }
  });
});