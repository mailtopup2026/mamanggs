document.addEventListener("DOMContentLoaded", async () => {
  // Mapping aset gambar & developer untuk Brand Game
  const gameMeta = {
    "MOBILE LEGENDS": {
      slug: "mlbb",
      dev: "Moonton",
      img: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80"
    },
    "FREE FIRE": {
      slug: "ff",
      dev: "Garena",
      img: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80"
    },
    "PUBG MOBILE": {
      slug: "pubg",
      dev: "Level Infinite",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    "GENSHIN IMPACT": {
      slug: "genshin",
      dev: "HoYoverse",
      img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=500&q=80"
    },
    "VALORANT": {
      slug: "valorant",
      dev: "Riot Games",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    "HONOR OF KINGS": {
      slug: "hok",
      dev: "Level Infinite",
      img: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80"
    },
    "WHITEOUT SURVIVAL": {
      slug: "whiteout",
      dev: "Century Games",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80"
    },
    "POINT BLANK": {
      slug: "pb",
      dev: "Zepetto",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    "STEAM WALLET": {
      slug: "steam",
      dev: "Valve Corp",
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80"
    }
  };

  // Selector fleksibel (mencari container katalog di index.html)
  const container = document.querySelector("#gameGridContainer, .game-grid, .grid-catalog, .catalog-grid, .game-list-grid") 
    || document.querySelector(".tab-content") 
    || document.querySelector(".filter-tabs + div");

  if (!container) {
    console.error("Container katalog tidak ditemukan di HTML.");
    return;
  }

  // Tampilkan skeleton/loading
  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: #f59e0b; margin-bottom: 10px;"></i>
      <p>Memuat katalog game resmi...</p>
    </div>
  `;

  let activeGames = [];

  // 1. Tarik Game Unik dari Supabase
  try {
    if (window.supabase) {
      const { data, error } = await window.supabase
        .from("products")
        .select("brand, game_code, category")
        .eq("buyer_product_status", true);

      if (!error && data && data.length > 0) {
        // Ambil brand unik
        const uniqueBrands = [...new Set(data.map(item => item.brand?.toUpperCase()))];
        
        activeGames = uniqueBrands.map(brandName => {
          // Cari meta yang cocok
          const matchedKey = Object.keys(gameMeta).find(k => brandName.includes(k)) || "";
          const meta = gameMeta[matchedKey] || {};

          return {
            name: brandName,
            slug: meta.slug || brandName.toLowerCase().replace(/\s+/g, "-"),
            dev: meta.dev || "Official Publisher",
            image: meta.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
            category: "game"
          };
        });
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed, fallback ke data lokal:", err);
  }

  // 2. Fallback jika Supabase belum ready
  if (activeGames.length === 0) {
    activeGames = Object.entries(gameMeta).map(([brandName, val]) => ({
      name: brandName,
      slug: val.slug,
      dev: val.dev,
      image: val.img,
      category: brandName.includes("STEAM") ? "voucher" : "game"
    }));
  }

  // 3. Render Card Poster
  function render(filterCat = "all") {
    container.innerHTML = "";
    
    const filtered = filterCat === "all" || filterCat === "game" 
      ? activeGames 
      : activeGames.filter(g => g.category === filterCat);

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">Belum ada produk di kategori ini.</div>`;
      return;
    }

    filtered.forEach(game => {
      const card = document.createElement("a");
      card.href = `/order.html?game=${game.slug}`;
      card.className = "game-poster-card";
      card.style.textDecoration = "none";
      card.innerHTML = `
        <div class="poster-img-wrap" style="position: relative; overflow: hidden; border-radius: 12px; aspect-ratio: 3/4; background: #1e293b;">
          <img src="${game.image}" alt="${game.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" loading="lazy">
        </div>
        <div class="poster-info" style="padding: 10px 4px 0;">
          <h3 style="color: #fff; font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game.name}</h3>
          <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">${game.dev}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // 4. Tab Listener
  document.querySelectorAll(".tab-item, .filter-tab-btn, .category-tab, .filter-nav button").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab-item, .filter-tab-btn, .category-tab, .filter-nav button").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const text = this.innerText.toLowerCase();
      if (text.includes("voucher")) render("voucher");
      else render("game");
    });
  });

  render("all");
});