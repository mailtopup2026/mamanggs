document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const articlesGrid = document.getElementById("articlesGrid");
  const blogSearchInput = document.getElementById("blogSearchInput");
  const catButtons = document.querySelectorAll(".cat-tab-btn");

  let allArticles = [];
  let currentCat = "ALL";

  async function fetchArticles() {
    const client = getClient();
    if (!client) {
      setTimeout(fetchArticles, 200);
      return;
    }

    try {
      const { data, error } = await client
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      allArticles = data || [];
      renderArticles();
    } catch (err) {
      console.error("Gagal load artikel:", err);
      if (articlesGrid) {
        articlesGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--accent-red);">
            <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
            <p style="margin-top: 10px;">Gagal memuat artikel: ${err.message}</p>
          </div>
        `;
      }
    }
  }

  function renderArticles() {
    if (!articlesGrid) return;
    const query = blogSearchInput ? blogSearchInput.value.toLowerCase().trim() : "";

    const filtered = allArticles.filter((art) => {
      const matchCat = currentCat === "ALL" || art.category.toLowerCase() === currentCat.toLowerCase();
      const matchQuery =
        (art.title && art.title.toLowerCase().includes(query)) ||
        (art.summary && art.summary.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open fa-3x" style="opacity: 0.5;"></i>
          <h3 style="color: #fff; margin: 14px 0 6px;">Tidak ada artikel ditemukan</h3>
          <p>Coba kata kunci lain atau pilih kategori yang berbeda.</p>
        </div>
      `;
      return;
    }

    articlesGrid.innerHTML = filtered.map((art) => {
      const date = new Date(art.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      return `
        <a href="/blog-detail.html?slug=${art.slug}" class="article-card">
          <div class="article-thumb-wrap">
            <img src="${art.thumbnail_url}" alt="${art.title}" class="article-thumb-img" loading="lazy">
            <span class="article-category-tag">${art.category}</span>
          </div>
          <div class="article-body">
            <h3 class="article-title">${art.title}</h3>
            <p class="article-summary">${art.summary}</p>
            <div class="article-footer-meta">
              <span><i class="fa-solid fa-calendar-days"></i> ${date}</span>
              <span><i class="fa-solid fa-eye"></i> ${art.views_count || 0} views</span>
            </div>
          </div>
        </a>
      `;
    }).join("");
  }

  // Event Klik Tab Kategori
  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      catButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.getAttribute("data-cat");
      renderArticles();
    });
  });

  // Event Input Pencarian
  if (blogSearchInput) {
    blogSearchInput.addEventListener("input", renderArticles);
  }

  fetchArticles();
});