document.addEventListener("DOMContentLoaded", () => {
  // DAFTAR KATALOG GAME UTAMA RESMI MAMANGGS
  const gamesList = [
    {
      name: "Mobile Legends",
      dev: "Moonton",
      slug: "mlbb",
      category: "game",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Free Fire Max",
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
      name: "Valorant Points",
      dev: "Riot Games",
      slug: "valorant",
      category: "game",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Honor of Kings",
      dev: "Level Infinite",
      slug: "hok",
      category: "game",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Whiteout Survival",
      dev: "Century Games",
      slug: "whiteout",
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

  const gridContainer = document.getElementById("gameGridContainer") || document.querySelector(".game-grid");
  const tabButtons = document.querySelectorAll(".filter-tab-btn, .category-tab");

  function renderGames(filterCategory = "all") {
    if (!gridContainer) return;

    const filtered = filterCategory === "all" || filterCategory === "game"
      ? gamesList
      : gamesList.filter(g => g.category === filterCategory);

    gridContainer.innerHTML = "";

    filtered.forEach(game => {
      const card = document.createElement("a");
      card.href = `/order.html?game=${game.slug}`;
      card.className = "game-poster-card";
      card.innerHTML = `
        <div class="poster-img-wrap">
          <img src="${game.image}" alt="${game.name}" loading="lazy">
        </div>
        <div class="poster-info">
          <h3>${game.name}</h3>
          <p>${game.dev}</p>
        </div>
      `;
      gridContainer.appendChild(card);
    });
  }

  // Filter Tab Handler
  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.getAttribute("data-category") || "all";
        renderGames(cat);
      });
    });
  }

  // Render awal
  renderGames("all");
});