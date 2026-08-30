document.addEventListener("DOMContentLoaded", function () {
  var gamesData = [
    {
      name: "Mobile Legends",
      dev: "Moonton",
      slug: "mlbb",
      category: "game",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Free Fire",
      dev: "Garena",
      slug: "ff",
      category: "game",
      image: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "PUBG Mobile",
      dev: "Level Infinite",
      slug: "pubg",
      category: "game",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Genshin Impact",
      dev: "HoYoverse",
      slug: "genshin",
      category: "game",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Valorant",
      dev: "Riot Games",
      slug: "valorant",
      category: "game",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Honor of Kings",
      dev: "Level Infinite",
      slug: "hok",
      category: "game",
      image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Whiteout Survival",
      dev: "Century Games",
      slug: "whiteout",
      category: "game",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Point Blank",
      dev: "Zepetto",
      slug: "pb",
      category: "game",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Steam Wallet IDR",
      dev: "Valve",
      slug: "steam",
      category: "voucher",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80"
    }
  ];

  var container = document.getElementById("mainCatalogGrid");
  if (!container) {
    console.warn("Element #mainCatalogGrid tidak ditemukan!");
    return;
  }

  function renderGrid(filterType) {
    container.innerHTML = "";
    var currentFilter = filterType || "all";

    var list = (currentFilter === "all" || currentFilter === "reseller")
      ? gamesData
      : gamesData.filter(function (item) { return item.category === currentFilter; });

    if (list.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Belum ada produk untuk kategori ini.</div>';
      return;
    }

    list.forEach(function (game) {
      var card = document.createElement("a");
      card.href = "/order.html?game=" + game.slug;
      card.className = "catalog-poster-card";
      card.innerHTML = 
        '<img src="' + game.image + '" alt="' + game.name + '" loading="lazy">' +
        '<div style="padding: 12px 14px;">' +
          '<h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + game.name + '</h3>' +
          '<p style="font-size: 0.76rem; color: #94a3b8; margin: 0;">' + game.dev + '</p>' +
        '</div>';
      container.appendChild(card);
    });
  }

  // Event Listener Tab Filter
  var tabButtons = document.querySelectorAll(".catalog-tab-pill");
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabButtons.forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
      var filter = this.getAttribute("data-filter") || "all";
      renderGrid(filter);
    });
  });

  // Render langsung saat halaman terbuka
  renderGrid("all");
});