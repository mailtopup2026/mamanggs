document.addEventListener("DOMContentLoaded", async function () {
  // Pastikan Supabase sudah terhubung
  if (!window.supabase) {
    console.error("Koneksi Supabase tidak ditemukan!");
    return;
  }

  let allGamesData = [];
  let flashSaleInterval;

  // ==========================================
  // 1. LOAD SLIDER BANNERS
  // ==========================================
  async function loadBanners() {
    const container = document.getElementById("dynamicBanners");
    const dotsContainer = document.getElementById("dynamicBannerDots");
    if (!container) return;

    try {
      const { data: banners, error } = await window.supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!banners || banners.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;">Belum ada promo banner.</div>';
        return;
      }

      container.innerHTML = banners.map((b, index) => `
        <a href="${b.target_url}" class="carousel-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${b.image_url}'); background-size: cover; background-position: center; text-decoration: none; display: ${index === 0 ? 'flex' : 'none'}; width: 100%; height: 100%; position: absolute; inset: 0; border-radius: 18px;">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 30px 20px 15px;">
            <h2 style="color: #fff; margin: 0; font-size: 1.4rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${b.title}</h2>
          </div>
        </a>
      `).join("");

      if (dotsContainer) {
        dotsContainer.innerHTML = banners.map((_, index) => `
          <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `).join("");
      }

      initCarousel(banners.length);

    } catch (err) {
      console.error("Gagal load banner:", err.message);
    }
  }

  function initCarousel(totalSlides) {
    if (totalSlides <= 1) return;
    let currentIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');

    setInterval(() => {
      slides[currentIndex].style.display = 'none';
      slides[currentIndex].classList.remove('active');
      if(dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (currentIndex + 1) % totalSlides;

      slides[currentIndex].style.display = 'flex';
      slides[currentIndex].classList.add('active');
      if(dots[currentIndex]) dots[currentIndex].classList.add('active');
    }, 4000); // Ganti slide setiap 4 detik
  }

  // ==========================================
  // 2. LOAD FLASH SALES & COUNTDOWN
  // ==========================================
  async function loadFlashSales() {
    const wrapper = document.getElementById("flashSaleWrapper");
    const track = document.getElementById("dynamicFlashSales");
    if (!wrapper || !track) return;

    try {
      const now = new Date().toISOString();
      const { data: flashSales, error } = await window.supabase
        .from('flash_sales')
        .select(`*, products (product_name, brand, price_sell)`)
        .eq('is_active', true)
        .gte('end_time', now)
        .order('end_time', { ascending: true });

      if (error) throw error;

      if (!flashSales || flashSales.length === 0) {
        wrapper.style.display = 'none'; // Sembunyikan section jika tidak ada flash sale
        return;
      }

      // Duplikasi data agar animasi marquee bisa berputar mulus (efek infinite scroll)
      const displayData = [...flashSales, ...flashSales, ...flashSales]; 

      track.innerHTML = displayData.map(fs => {
        const prodName = fs.products?.product_name || fs.buyer_sku_code;
        const brand = fs.products?.brand || "Game";
        const normalPrice = Number(fs.products?.price_sell || 0).toLocaleString("id-ID");
        const flashPrice = Number(fs.flash_price || 0).toLocaleString("id-ID");
        const hemat = Number(fs.products?.price_sell || 0) - Number(fs.flash_price || 0);
        const hematLabel = hemat > 1000 ? `HEMAT ${Math.floor(hemat/1000)}RB` : fs.discount_label;
        
        // Cari cover game dari allGamesData
        const gameData = allGamesData.find(g => g.game_code.toUpperCase() === brand.toUpperCase() || brand.toLowerCase().includes(g.game_code));
        const imgUrl = gameData ? gameData.image_url : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80";
        // Asumsi game_code bisa didapat dari string brand awal jika ga ketemu
        const targetGame = gameData ? gameData.game_code : brand.toLowerCase().replace(/\s+/g, '-');

        return `
          <a href="/order.html?game=${targetGame}" class="flash-promo-card">
            <span class="ribbon-save">${hematLabel}</span>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; padding-right: 32px;">
              <img src="${imgUrl}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
              <div style="overflow: hidden;">
                <h4 style="font-size: 0.78rem; font-weight: 800; margin: 0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; color: #fff;">${prodName}</h4>
                <p style="font-size: 0.65rem; color: #94a3b8; margin: 0;">${brand}</p>
              </div>
            </div>
            <div>
              <span style="font-size: 0.68rem; color: #64748b; text-decoration: line-through; display: block; line-height: 1;">Rp ${normalPrice}</span>
              <div style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; margin-top: 2px;">Rp ${flashPrice}</div>
            </div>
          </a>
        `;
      }).join("");

      // Start Real Countdown berdasarkan end_time terdekat
      startFlashSaleCountdown(new Date(flashSales[0].end_time).getTime());

    } catch (err) {
      console.error("Gagal load flash sale:", err.message);
      wrapper.style.display = 'none';
    }
  }

  function startFlashSaleCountdown(endTimeMs) {
    if(flashSaleInterval) clearInterval(flashSaleInterval);

    flashSaleInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTimeMs - now;

      if (distance < 0) {
        clearInterval(flashSaleInterval);
        document.getElementById("flashSaleWrapper").style.display = 'none';
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      if (document.getElementById("flashHours")) document.getElementById("flashHours").innerText = String(h).padStart(2, "0");
      if (document.getElementById("flashMinutes")) document.getElementById("flashMinutes").innerText = String(m).padStart(2, "0");
      if (document.getElementById("flashSeconds")) document.getElementById("flashSeconds").innerText = String(s).padStart(2, "0");
    }, 1000);
  }

  // ==========================================
  // 3. LOAD KATALOG GAME & POPULAR GAMES
  // ==========================================
  async function loadGames() {
    try {
      const { data: games, error } = await window.supabase
        .from('game_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      allGamesData = games || [];

      renderPopularGames(allGamesData.filter(g => g.is_popular));
      renderMainCatalog("all");

    } catch (err) {
      console.error("Gagal load game categories:", err.message);
      document.getElementById("mainCatalogGrid").innerHTML = `<p style="color: #f87171;">Gagal memuat katalog: ${err.message}</p>`;
    }
  }

  function renderPopularGames(popularGames) {
    const container = document.getElementById("dynamicPopularGames");
    if (!container) return;

    if (popularGames.length === 0) {
      container.parentElement.style.display = 'none';
      return;
    }

    container.innerHTML = popularGames.map(game => `
      <a href="/order.html?game=${game.game_code}" class="popular-compact-card">
        <img src="${game.image_url}" alt="${game.title}">
        <div style="overflow: hidden;">
          <h4 style="font-size: 0.88rem; font-weight: 800; margin: 0 0 2px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${game.title}</h4>
          <p style="font-size: 0.72rem; color: #94a3b8; margin: 0;">${game.developer}</p>
        </div>
      </a>
    `).join("");
  }

  function renderMainCatalog(filterType) {
    const container = document.getElementById("mainCatalogGrid");
    if (!container) return;
    container.innerHTML = "";

    // Karena di DB game_categories tidak ada spesifik kolom "category" PPOB/Game/Voucher,
    // kita asumsikan semua tampil di filter "all".
    let list = allGamesData;
    
    // Fitur filter opsional kedepannya
    // if (filterType !== "all" && filterType !== "reseller") {
    //   list = allGamesData.filter(g => g.category === filterType);
    // }

    if (list.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Belum ada produk game yang diatur admin.</div>';
      return;
    }

    container.innerHTML = list.map(game => `
      <a href="/order.html?game=${game.game_code}" class="catalog-poster-card">
        <img src="${game.image_url}" alt="${game.title}" loading="lazy">
        <div style="padding: 12px 14px;">
          <h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${game.title}</h3>
          <p style="font-size: 0.76rem; color: #94a3b8; margin: 0;">${game.developer}</p>
        </div>
      </a>
    `).join("");
  }

  // Event Listener Tab Filter Katalog
  const tabButtons = document.querySelectorAll(".catalog-tab-pill");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      tabButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const filter = this.getAttribute("data-filter") || "all";
      renderMainCatalog(filter);
    });
  });

  // Eksekusi pemuatan data secara berurutan
  await loadGames();        // Load game dulu agar flash sale bisa pakai cover gambarnya
  await loadFlashSales();   // Load flash sale (marquee & timer db)
  await loadBanners();      // Load banner carousel
});