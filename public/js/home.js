document.addEventListener("DOMContentLoaded", async function () {
  var gameMeta = {
    "MOBILE LEGENDS": {
      slug: "mlbb",
      dev: "Moonton",
      img: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "FREE FIRE": {
      slug: "ff",
      dev: "Garena",
      img: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "PUBG MOBILE": {
      slug: "pubg",
      dev: "Level Infinite",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "GENSHIN IMPACT": {
      slug: "genshin",
      dev: "HoYoverse",
      img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "VALORANT": {
      slug: "valorant",
      dev: "Riot Games",
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "HONOR OF KINGS": {
      slug: "hok",
      dev: "Level Infinite",
      img: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "WHITEOUT SURVIVAL": {
      slug: "whiteout",
      dev: "Century Games",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "POINT BLANK": {
      slug: "pb",
      dev: "Zepetto",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
      category: "game"
    },
    "STEAM WALLET": {
      slug: "steam",
      dev: "Valve Corp",
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
      category: "voucher"
    }
  };

  var gridContainer = document.getElementById("mainCatalogGrid");
  if (!gridContainer) return;

  var activeCatalog = [];

  // 1. Tarik Data Brand Resmi dari Supabase
  try {
    if (window.supabase) {
      var res = await window.supabase
        .from("products")
        .select("brand, game_code, category")
        .eq("buyer_product_status", true);

      if (!res.error && res.data && res.data.length > 0) {
        var rawBrands = res.data.map(function (item) {
          return item.brand ? item.brand.toUpperCase() : "";
        }).filter(Boolean);

        var uniqueBrands = Array.from(new Set(rawBrands));

        activeCatalog = uniqueBrands.map(function (brandName) {
          var matchedKey = Object.keys(gameMeta).find(function (k) {
            return brandName.indexOf(k) !== -1;
          }) || "";
          var meta = gameMeta[matchedKey] || {};

          return {
            name: brandName,
            slug: meta.slug || brandName.toLowerCase().replace(/\s+/g, "-"),
            dev: meta.dev || "Official Publisher",
            image: meta.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
            category: meta.category || (brandName.indexOf("VOUCHER") !== -1 || brandName.indexOf("STEAM") !== -1 ? "voucher" : "game")
          };
        });
      }
    }
  } catch (err) {
    console.warn("Koneksi Supabase fallback:", err);
  }

  // 2. Fallback jika Supabase belum ada data
  if (activeCatalog.length === 0) {
    activeCatalog = Object.keys(gameMeta).map(function (brandName) {
      var val = gameMeta[brandName];
      return {
        name: brandName,
        slug: val.slug,
        dev: val.dev,
        image: val.img,
        category: val.category
      };
    });
  }

  // 3. Render Card Poster
  function renderCatalog(filterKey) {
    gridContainer.innerHTML = "";

    var targetKey = filterKey || "all";
    var filtered = (targetKey === "all" || targetKey === "game")
      ? activeCatalog
      : activeCatalog.filter(function (g) { return g.category === targetKey; });

    if (filtered.length === 0) {
      gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Belum ada produk di kategori ini.</div>';
      return;
    }

    filtered.forEach(function (game) {
      var card = document.createElement("a");
      card.href = "/order.html?game=" + game.slug;
      card.className = "catalog-poster-card";
      card.innerHTML = 
        '<img src="' + game.image + '" alt="' + game.name + '" loading="lazy">' +
        '<div style="padding: 12px 14px;">' +
          '<h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + game.name + '</h3>' +
          '<p style="font-size: 0.76rem; color: #94a3b8; margin: 0;">' + game.dev + '</p>' +
        '</div>';
      gridContainer.appendChild(card);
    });
  }

  // 4. Tab Filter Listener
  var tabButtons = document.querySelectorAll(".catalog-tab-pill");
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabButtons.forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
      var filter = this.getAttribute("data-filter") || "all";
      renderCatalog(filter);
    });
  });

  // Render Tampilan Awal
  renderCatalog("all");
});