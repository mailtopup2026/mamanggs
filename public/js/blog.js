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
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">
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
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;">
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
        <a href="/blog-detail.html?slug=${art.slug}" style="background: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; transition: transform 0.25s ease, border-color 0.25s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          
          <!-- THUMBNAIL -->
          <div style="width: 100%; height: 180px; position: relative; overflow: hidden; background: #0f172a;">
            <img src="${art.thumbnail_url}" alt="${art.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            <span style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 12px; backdrop-filter: blur(4px);">
              ${art.category}
            </span>
          </div>

          <!-- KONTEN CARD -->
          <div style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
            <h3 style="font-size: 1rem; font-weight: 800; color: #ffffff; line-height: 1.4; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${art.title}
            </h3>
            
            <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.5; margin: 0 0 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;">
              ${art.summary}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 12px;">
              <span style="display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-calendar-days"></i> ${date}</span>
              <span style="display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-eye"></i> ${art.views_count || 0} views</span>
            </div>
          </div>
        </a>
      `;
    }).join("");
  }

  // Event Klik Tab Kategori
  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      catButtons.forEach((b) => {
        b.style.background = "#1e293b";
        b.style.color = "#94a3b8";
        b.style.borderColor = "rgba(255,255,255,0.1)";
      });
      btn.style.background = "#f59e0b";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "#f59e0b";

      currentCat = btn.getAttribute("data-cat");
      renderArticles();
    });
  });

  // Event Search
  if (blogSearchInput) {
    blogSearchInput.addEventListener("input", renderArticles);
  }

  fetchArticles();
});