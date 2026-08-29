document.addEventListener("DOMContentLoaded", async () => {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
    if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
    return null;
  }

  const postTitle = document.getElementById("postTitle");
  const postSlug = document.getElementById("postSlug");
  const postCategory = document.getElementById("postCategory");
  const postThumbnail = document.getElementById("postThumbnail");
  const postSummary = document.getElementById("postSummary");
  const postContent = document.getElementById("postContent");
  const articleForm = document.getElementById("articleForm");
  const editorAlert = document.getElementById("editorAlert");
  const btnPublish = document.getElementById("btnPublishArticle");

  // Auto generate Slug dari Judul
  postTitle.addEventListener("input", () => {
    const slug = postTitle.value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    postSlug.value = slug;
  });

  // Handle Submit Form
  articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const client = getClient();
    if (!client) {
      alert("Database Supabase belum siap!");
      return;
    }

    btnPublish.disabled = true;
    btnPublish.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan Artikel...`;
    editorAlert.style.display = "none";

    const payload = {
      title: postTitle.value.trim(),
      slug: postSlug.value.trim(),
      category: postCategory.value,
      thumbnail_url: postThumbnail.value.trim(),
      summary: postSummary.value.trim(),
      content: postContent.value.trim(),
      is_published: true,
      reactions: { fire: 0, gem: 0, crown: 0, rocket: 0 }
    };

    try {
      const { data, error } = await client
        .from("articles")
        .insert([payload])
        .select();

      btnPublish.disabled = false;
      btnPublish.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publikasikan Artikel Sekarang`;

      if (error) throw error;

      editorAlert.className = "alert-box alert-success";
      editorAlert.innerHTML = `Artikel berhasil diterbitkan! <a href="/blog-detail.html?slug=${payload.slug}" target="_blank" style="color: #fff; text-decoration: underline; font-weight: 800; margin-left: 6px;">Buka Artikel <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
      editorAlert.style.display = "block";

      articleForm.reset();
    } catch (err) {
      btnPublish.disabled = false;
      btnPublish.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publikasikan Artikel Sekarang`;
      editorAlert.className = "alert-box alert-error";
      editorAlert.innerText = `Gagal mempublikasikan: ${err.message}`;
      editorAlert.style.display = "block";
    }
  });
});