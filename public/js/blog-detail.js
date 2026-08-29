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
          <div style="text-align: center; padding: 50px 20px; color: #94a3b8;">
            <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: #ef4444;"></i>
            <h3 style="color: #fff; margin: 12px 0 6px;">Artikel Tidak Ditemukan</h3>
            <p>Artikel mungkin telah diubah atau dihapus.</p>
            <br>
            <a href="/blog.html" style="display: inline-flex; align-items: center; gap: 8px; background: #f59e0b; color: #000; padding: 10px 20px; border-radius: 30px; font-weight: 800; text-decoration: none;">
              <i class="fa-solid fa-arrow-left"></i> Kembali ke Blog
            </a>
          </div>
        `;
        return;
      }

      // Update Title & Meta SEO
      document.title = `${art.title} - MamangGS Blog`;
      const pageTitle = document.getElementById("pageTitle");
      if (pageTitle) pageTitle.innerText = `${art.title} - MamangGS`;
      const metaDesc = document.getElementById("pageMetaDesc");
      if (metaDesc) metaDesc.setAttribute("content", art.summary);

      // Tambah Counter Views
      client.from("articles").update({ views_count: (art.views_count || 0) + 1 }).eq("id", art.id).then();

      const date = new Date(art.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      const currentUrl = encodeURIComponent(window.location.href);
      const articleTitleEncoded = encodeURIComponent(art.title);

      const reactions = art.reactions || { fire: 0, gem: 0, crown: 0, rocket: 0 };
      const votedKey = `voted_art_${art.id}`;
      const userVotes = JSON.parse(localStorage.getItem(votedKey) || "{}");

      // SMART CTA ENGINE: Deteksi Game dari Judul & Kategori
      const checkText = `${art.title} ${art.category} ${art.summary}`.toLowerCase();
      
      let ctaHeadline = "🎮 Mau Top Up Game Murah & Kilat?";
      let ctaSub = "Dapatkan diskon spesial diamond & voucher otomatis 24 jam hanya di MamangGS!";
      let ctaBtnText = "Top Up Sekarang";
      let ctaLink = "/#games-section";

      if (checkText.includes("mlbb") || checkText.includes("mobile legends") || checkText.includes("diamond kuning")) {
        ctaHeadline = "🛡️ Top Up Diamond Mobile Legends Resmi";
        ctaSub = "Beli diamond MLBB 100% legal, proses otomatis 1 detik langsung masuk ke akun!";
        ctaBtnText = "Beli Diamond MLBB";
        ctaLink = "/order.html?game=mlbb";
      } else if (checkText.includes("free fire") || checkText.includes("ff") || checkText.includes("headshot")) {
        ctaHeadline = "🔥 Top Up Diamond Free Fire Murah";
        ctaSub = "Top up diamond FF instan tanpa antre, cocok untuk gacha event bundle terbaru!";
        ctaBtnText = "Beli Diamond FF";
        ctaLink = "/order.html?game=freefire";
      } else if (checkText.includes("pubg") || checkText.includes("uc pubg")) {
        ctaHeadline = "🎯 Top Up UC PUBG Mobile Fast Delivery";
        ctaSub = "Dapatkan UC PUBG harga distributor resmi untuk Royale Pass & Lucky Spin!";
        ctaBtnText = "Beli UC PUBG";
        ctaLink = "/order.html?game=pubgm";
      } else if (checkText.includes("genshin") || checkText.includes("primogem") || checkText.includes("welkin")) {
        ctaHeadline = "✨ Top Up Genesis Crystal & Welkin Moon";
        ctaSub = "Gacha karakter impianmu dengan harga kristal Genshin Impact paling terjangkau!";
        ctaBtnText = "Beli Crystal Genshin";
        ctaLink = "/order.html?game=genshin";
      } else if (checkText.includes("valorant") || checkText.includes("vp")) {
        ctaHeadline = "⚡ Top Up Valorant Points (VP) Indonesia";
        ctaSub = "Sikat bundle skin favoritmu di Night Market sekarang dengan VP termurah!";
        ctaBtnText = "Beli Valorant Points";
        ctaLink = "/order.html?game=valorant";
      } else if (checkText.includes("promo") || checkText.includes("diskon") || checkText.includes("flash sale")) {
        ctaHeadline = "🎁 Klaim Voucher Promo MamangGS";
        ctaSub = "Gunakan kode promo dan manfaatkan flash sale weekend sebelum kuota habis!";
        ctaBtnText = "Lihat Promo Aktif";
        ctaLink = "/#games-section";
      } else if (checkText.includes("leaderboard") || checkText.includes("sultan") || checkText.includes("hall of fame")) {
        ctaHeadline = "🏆 Rebut Juara Top Spender Season Ini!";
        ctaSub = "Tingkatkan akumulasi transaksi top up dan klaim Hadiah Voucher Saldo 500K!";
        ctaBtnText = "Cek Leaderboard";
        ctaLink = "/leaderboard.html";
      }

      // Render Layout Pembaca Kompak
      articleCard.innerHTML = `
        <!-- HEADER ARTIKEL -->
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; font-size: 0.76rem; font-weight: 800; padding: 4px 14px; border-radius: 20px; margin-bottom: 12px;">
            ${art.category}
          </span>
          <h1 style="font-size: 1.85rem; font-weight: 900; color: #ffffff; line-height: 1.35; margin: 0 0 14px; letter-spacing: -0.3px;">
            ${art.title}
          </h1>
          <div style="display: flex; align-items: center; gap: 16px; font-size: 0.82rem; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 16px; flex-wrap: wrap;">
            <span style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-user-shield" style="color: #f59e0b;"></i> ${art.author_name || 'Admin MamangGS'}</span>
            <span style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-calendar-days"></i> ${date}</span>
            <span style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-eye"></i> ${(art.views_count || 0) + 1} views</span>
          </div>
        </div>

        <!-- GAMBAR COVER ARTIKEL -->
        <div style="width: 100%; height: 340px; overflow: hidden; border-radius: 14px; margin: 20px 0; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.06);">
          <img src="${art.thumbnail_url}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
        </div>

        <!-- ISI KONTEN BACAAN -->
        <div class="article-content-body" style="font-size: 0.96rem; line-height: 1.8; color: #cbd5e1; margin-bottom: 30px;">
          ${art.content}
        </div>

        <!-- SLOT IKLAN MINI / SPONSORED PROMO BANNER -->
        <div style="margin: 30px 0; background: rgba(10, 15, 29, 0.9); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 12px 16px; text-align: center;">
          <span style="display: inline-block; font-size: 0.65rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 6px;"><i class="fa-solid fa-rectangle-ad"></i> SPONSORED PROMO</span>
          <a href="/leaderboard.html" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 10px 14px; text-decoration: none; color: #fff;">
            <div style="text-align: left;">
              <p style="font-size: 0.85rem; font-weight: 800; color: #fbbf24; margin: 0 0 2px;">🏆 Season 1 Leaderboard Sultan MamangGS</p>
              <p style="font-size: 0.75rem; color: #94a3b8; margin: 0;">Top up game favoritmu dan raih Hadiah Voucher 500K!</p>
            </div>
            <span style="background: #f59e0b; color: #000; font-weight: 800; font-size: 0.72rem; padding: 5px 12px; border-radius: 20px; white-space: nowrap;">Lihat Ranking <i class="fa-solid fa-chevron-right"></i></span>
          </a>
        </div>

        <!-- REAKSI EMOJI SULTAN -->
        <div style="margin: 35px 0 25px; padding: 20px 0; border-top: 1px solid rgba(255, 255, 255, 0.08); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
          <div style="font-size: 0.9rem; font-weight: 800; color: #fff; margin-bottom: 14px;">Gimana menurutmu artikel ini?</div>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button class="reaction-btn" data-type="fire" style="background: ${userVotes.fire ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.85)'}; border: 1.5px solid ${userVotes.fire ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}; color: #fff; border-radius: 30px; padding: 8px 16px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>🔥 GG</span> <span id="count-fire" style="color: #fbbf24;">${reactions.fire || 0}</span>
            </button>
            <button class="reaction-btn" data-type="gem" style="background: ${userVotes.gem ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.85)'}; border: 1.5px solid ${userVotes.gem ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}; color: #fff; border-radius: 30px; padding: 8px 16px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>💎 Sultan</span> <span id="count-gem" style="color: #fbbf24;">${reactions.gem || 0}</span>
            </button>
            <button class="reaction-btn" data-type="crown" style="background: ${userVotes.crown ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.85)'}; border: 1.5px solid ${userVotes.crown ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}; color: #fff; border-radius: 30px; padding: 8px 16px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>👑 Mantap</span> <span id="count-crown" style="color: #fbbf24;">${reactions.crown || 0}</span>
            </button>
            <button class="reaction-btn" data-type="rocket" style="background: ${userVotes.rocket ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.85)'}; border: 1.5px solid ${userVotes.rocket ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}; color: #fff; border-radius: 30px; padding: 8px 16px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>🚀 Kilat</span> <span id="count-rocket" style="color: #fbbf24;">${reactions.rocket || 0}</span>
            </button>
          </div>
        </div>

        <!-- SHARE MEDIA SOSIAL -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 30px;">
          <span style="font-size: 0.84rem; font-weight: 700; color: #94a3b8;"><i class="fa-solid fa-share-nodes"></i> Bagikan Artikel:</span>
          <div style="display: flex; gap: 8px;">
            <a href="https://api.whatsapp.com/send?text=${articleTitleEncoded}%20${currentUrl}" target="_blank" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(15, 23, 42, 0.8); color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 1rem; text-decoration: none;" title="Share WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${articleTitleEncoded}&url=${currentUrl}" target="_blank" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(15, 23, 42, 0.8); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; text-decoration: none;" title="Share X/Twitter">
              <i class="fa-brands fa-x-twitter"></i>
            </a>
            <button id="btnCopyArticleLink" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(15, 23, 42, 0.8); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; cursor: pointer; border: none;" title="Salin Link">
              <i class="fa-solid fa-link"></i>
            </button>
          </div>
        </div>

        <!-- SMART CTA BOX DINAMIS SESUAI GAME -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95)); border: 1.5px solid rgba(245, 158, 11, 0.4); padding: 24px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);">
          <h3 style="font-size: 1.25rem; font-weight: 900; color: #fff; margin: 0 0 6px;">${ctaHeadline}</h3>
          <p style="font-size: 0.86rem; color: #94a3b8; margin: 0 0 16px;">${ctaSub}</p>
          <a href="${ctaLink}" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 12px 28px; border-radius: 50px; font-weight: 800; text-decoration: none; font-size: 0.92rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
            <i class="fa-solid fa-bolt"></i> ${ctaBtnText}
          </a>
        </div>
      `;

      // Event Salin Link
      document.getElementById("btnCopyArticleLink").addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link artikel berhasil disalin ke clipboard!");
      });

      // Event Reaksi Emoji Klik
      document.querySelectorAll(".reaction-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const type = btn.getAttribute("data-type");
          if (userVotes[type]) return;

          btn.style.background = "rgba(245, 158, 11, 0.2)";
          btn.style.borderColor = "#f59e0b";
          userVotes[type] = true;
          localStorage.setItem(votedKey, JSON.stringify(userVotes));

          const countEl = document.getElementById(`count-${type}`);
          if (countEl) countEl.innerText = Number(countEl.innerText) + 1;

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