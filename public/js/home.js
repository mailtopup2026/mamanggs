document.addEventListener("DOMContentLoaded", () => {
  // DATA KATALOG PRODUK LENGKAP (Struktur Siap Konek API Lapakgaming)
  const masterCatalog = [
    { name: "Twilight Chronicle", publisher: "IGG.COM", category: "all", link: "/order.html?game=twilight", poster: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80" },
    { name: "TNT Bomb-Saga", publisher: "Game Studio", category: "all", link: "/order.html?game=tnt", poster: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" },
    { name: "Gangstar Mirage City", publisher: "Gameloft", category: "all", link: "/order.html?game=gangstar", poster: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80" },
    { name: "Ragnarok Zero", publisher: "Gravity Corp", category: "all", link: "/order.html?game=ragnarok", poster: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80" },
    { name: "Gunbound M", publisher: "Softnyx", category: "all", link: "/order.html?game=gunbound", poster: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80" },
    { name: "Zula Strike", publisher: "Madbyte Games", category: "all", link: "/order.html?game=zula", poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80" },
    { name: "Google Play Code ID", publisher: "Google", category: "voucher", link: "/order.html?game=gplay", poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80" },
    { name: "Steam Wallet IDR", publisher: "Valve", category: "voucher", link: "/order.html?game=steam", poster: "https://images.unsplash.com/photo-1612287233202-0c9f1a0ff6d1?auto=format&fit=crop&w=400&q=80" },
    { name: "Bigo Live Diamonds", publisher: "Bigo Technology", category: "stream", link: "/order.html?game=bigo", poster: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=400&q=80" },
    { name: "Paket Data Telkomsel", publisher: "Telkomsel", category: "pulsa", link: "/order.html?game=tsel", poster: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80" }
  ];

  const catalogContainer = document.getElementById("mainCatalogGrid");
  const tabButtons = document.querySelectorAll(".catalog-tab-pill");
  const searchNavbar = document.getElementById("searchInput");

  let activeCategory = "all";

  // Fungsi Render Poster Game
  function renderCatalog(items) {
    if (!catalogContainer) return;

    if (items.length === 0) {
      catalogContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-gamepad fa-2x" style="color: #64748b; margin-bottom: 10px;"></i>
          <p style="font-size: 0.9rem; font-weight: 700; color: #cbd5e1; margin: 0 0 4px;">Produk tidak ditemukan</p>
          <span style="font-size: 0.78rem;">Coba gunakan kata kunci pencarian yang lain.</span>
        </div>
      `;
      return;
    }

    catalogContainer.innerHTML = items.map((game) => `
      <a href="${game.link}" class="catalog-poster-card">
        <img src="${game.poster}" alt="${game.name}" loading="lazy">
        <div style="padding: 12px; text-align: center;">
          <h4 style="font-size: 0.85rem; font-weight: 800; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${game.name}</h4>
          <p style="font-size: 0.72rem; color: #94a3b8; margin: 0;">${game.publisher}</p>
        </div>
      </a>
    `).join("");
  }

  // Filter Engine (Kategori + Pencarian)
  function applyFilter() {
    const keyword = (searchNavbar?.value || "").trim().toLowerCase();

    const filtered = masterCatalog.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(keyword) || item.publisher.toLowerCase().includes(keyword);
      return matchCategory && matchSearch;
    });

    renderCatalog(filtered);
  }

  // Event Klik Tab Kategori
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-filter") || "all";
      applyFilter();
    });
  });

  // Event Input Search di Navbar
  if (searchNavbar) {
    searchNavbar.addEventListener("input", () => {
      // Scroll perlahan ke bagian katalog saat mulai mengetik
      const catalogSection = document.getElementById("games-section");
      if (searchNavbar.value.length === 1 && catalogSection) {
        catalogSection.scrollIntoView({ behavior: "smooth" });
      }
      applyFilter();
    });
  }

  // Inisialisasi awal
  renderCatalog(masterCatalog);
});