document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const articleCard = document.getElementById("articleReaderCard");
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  if (!slug) {
    window.location.href = "/blog.html";
    return;
  }

  async function loadArticleDetail() {
    const client = getClient();
    if (!client) {
      setTimeout(loadArticleDetail, 200);
      return;
    }

    try {
      const { data: art, error } = await client
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !art) {
        articleCard.innerHTML = `
          <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: var(--accent-red);"></i>
            <h3 style="color: #fff; margin: 12px 0 6px;">Artikel Tidak Ditemukan</h3>
            <p>Artikel mungkin telah diubah atau dihapus.</p>
            <br>
            <a href="/blog.html" class="btn-cta-topup"><i class="fa-solid fa-arrow-left"></i> Kembali ke Blog</a>
          </div>
        `;
        return;
      }

      // Update Title & Meta SEO
      document.title = `${art.title} - MamangGS Blog`;
      document.getElementById("pageTitle").innerText = `${art.title} - MamangGS`;
      const metaDesc = document.getElementById("pageMetaDesc");
      if (metaDesc) metaDesc.setAttribute("content", art.summary);

      // Tambah Counter Views Secara Otomatis
      client.from("articles").update({ views_count: (art.views_count || 0) + 1 }).eq("id", art.id).then();

      const date = new Date(art.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      const currentUrl = encodeURIComponent(window.location.href);
      const articleTitleEncoded = encodeURIComponent(art.title);

      // Inisialisasi Reaksi
      const reactions = art.reactions || { fire: 0, gem: 0, crown: 0, rocket: 0 };

      // Cek apakah user lokal sudah pernah vote di artikel ini
      const votedKey = `voted_art_${art.id}`;
      const userVotes = JSON.parse(localStorage.getItem(votedKey) || "{}");

      // Smart CTA Text berdasarkan kategori
      let ctaHeadline = "Mau Top Up Game Murah & Kilat?";
      let ctaSub = "Dapatkan diskon spesial diamond & voucher otomatis 24 jam!";
      let ctaLink = "/";

      if (art.category.toUpperCase().includes("MLBB")) {
        ctaHeadline = "Top Up Diamond Mobile Legends Murah";
        ctaSub = "Beli diamond MLBB resmi, legal 100%, proses 1 detik langsung masuk!";
        ctaLink = "/#games-section";
      } else if (art.category.toUpperCase().includes("PROMO")) {
        ctaHeadline = "Klaim Diskon Top Up Spesial Event";
        ctaSub = "Manfaatkan flash sale weekend sekarang sebelum kuota voucher habis!";
        ctaLink = "/#games-section";
      }

      // Render Artikel Lengkap
      articleCard.innerHTML = `
        <div class="reader-header">
          <span class="reader-category-tag">${art.category}</span>
          <h1 class="reader-title">${art.title}</h1>
          <div class="reader-meta-row">
            <span><i class="fa-solid fa-user-shield"></i> ${art.author_name || 'Admin MamangGS'}</span>
            <span><i class="fa-solid fa-calendar-days"></i> ${date}</span>
            <span><i class="fa-solid fa-eye"></i> ${(art.views_count || 0) + 1} views</span>
          </div>
        </div>

        <img src="${art.thumbnail_url}" alt="${art.title}" class="reader-cover-img">

        <!-- KONTEN BACA -->
        <div class="reader-content">
          ${art.content}
        </div>

        <!-- SLOT IKLAN MINI / SPONSOR CLEAN -->
        <div class="ad-slot-mini">
          <span class="ad-label"><i class="fa-solid fa-rectangle-ad"></i> SPONSORED PROMO</span>
          <a href="/leaderboard.html" class="ad-banner-content">
            <div class="ad-text-wrap">
              <p class="ad-title">🏆 Ikuti Season 1 Leaderboard Sultan MamangGS</p>
              <p class="ad-desc">Top up game favoritmu dan menangkan Hadiah Voucher 500K!</p>
            </div>
            <span class="ad-action-pill">Lihat Ranking <i class="fa-solid fa-chevron-right"></i></span>
          </a>
        </div>

        <!-- REAKSI EMOJI GAMERS SULTAN -->
        <div class="reactions-wrapper">
          <div class="reactions-title">Gimana menurutmu artikel ini?</div>
          <div class="reactions-buttons-grid">
            <button class="reaction-btn ${userVotes.fire ? 'voted' : ''}" data-type="fire">
              <span>🔥 GG</span>
              <span class="reaction-count" id="count-fire">${reactions.fire || 0}</span>
            </button>
            <button class="reaction-btn ${userVotes.gem ? 'voted' : ''}" data-type="gem">
              <span>💎 Sultan</span>
              <span class="reaction-count" id="count-gem">${reactions.gem || 0}</span>
            </button>
            <button class="reaction-btn ${userVotes.crown ? 'voted' : ''}" data-type="crown">
              <span>👑 Mantap</span>
              <span class="reaction-count" id="count-crown">${reactions.crown || 0}</span>
            </button>
            <button class="reaction-btn ${userVotes.rocket ? 'voted' : ''}" data-type="rocket">
              <span>🚀 Kilat</span>
              <span class="reaction-count" id="count-rocket">${reactions.rocket || 0}</span>
            </button>
          </div>
        </div>

        <!-- BAGIKAN ARTIKEL -->
        <div class="share-section">
          <span class="share-label"><i class="fa-solid fa-share-nodes"></i> Bagikan Artikel:</span>
          <div class="share-buttons">
            <a href="https://api.whatsapp.com/send?text=${articleTitleEncoded}%20${currentUrl}" target="_blank" class="btn-share" title="Share ke WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${articleTitleEncoded}&url=${currentUrl}" target="_blank" class="btn-share" title="Share ke X / Twitter">
              <i class="fa-brands fa-x-twitter"></i>
            </a>
            <button class="btn-share" id="btnCopyArticleLink" title="Salin Link">
              <i class="fa-solid fa-link"></i>
            </button>
          </div>
        </div>

        <!-- SMART CTA ORDER BOX -->
        <div class="reader-cta-box">
          <h3>🎮 ${ctaHeadline}</h3>
          <p>${ctaSub}</p>
          <a href="${ctaLink}" class="btn-cta-topup"><i class="fa-solid fa-bolt"></i> Top Up Sekarang</a>
        </div>
      `;

      // Event Copy Link
      document.getElementById("btnCopyArticleLink").addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link artikel berhasil disalin ke clipboard!");
      });

      // Event Reaksi Emoji Klik
      document.querySelectorAll(".reaction-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const type = btn.getAttribute("data-type");
          if (userVotes[type]) return; // Cegah spam klik berulang

          btn.classList.add("voted");
          userVotes[type] = true;
          localStorage.setItem(votedKey, JSON.stringify(userVotes));

          const countEl = document.getElementById(`count-${type}`);
          if (countEl) countEl.innerText = Number(countEl.innerText) + 1;

          // Panggil RPC Supabase untuk update permanen
          try {
            await client.rpc("increment_article_reaction", {
              article_id: art.id,
              reaction_type: type
            });
          } catch (e) {
            console.warn("Reaksi gagal sinkron:", e);
          }
        });
      });

    } catch (err) {
      console.error("Gagal load artikel detail:", err);
    }
  }

  loadArticleDetail();
});