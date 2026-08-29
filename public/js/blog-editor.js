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
  const btnDraft = document.getElementById("btnSaveDraft");

  // Auto generate Slug URL dari Judul
  postTitle.addEventListener("input", () => {
    const slug = postTitle.value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    postSlug.value = slug;
  });

  // Fitur Toolbar Text Editor (Penyisipan Tag Instan)
  function insertFormat(tagOpen, tagClose) {
    const start = postContent.selectionStart;
    const end = postContent.selectionEnd;
    const text = postContent.value;
    const selectedText = text.substring(start, end) || "teks disini";
    const replacement = tagOpen + selectedText + tagClose;

    postContent.value = text.substring(0, start) + replacement + text.substring(end);
    postContent.focus();
    postContent.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
  }

  document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      switch (action) {
        case "bold":
          insertFormat("<strong>", "</strong>");
          break;
        case "italic":
          insertFormat("<em>", "</em>");
          break;
        case "h2":
          insertFormat("\n<h2>", "</h2>\n");
          break;
        case "h3":
          insertFormat("\n<h3>", "</h3>\n");
          break;
        case "ul":
          insertFormat("\n<ul>\n  <li>", "</li>\n</ul>\n");
          break;
        case "ol":
          insertFormat("\n<ol>\n  <li>", "</li>\n</ol>\n");
          break;
        case "link":
          const url = prompt("Masukkan URL Link (contoh: https://mamanggs.com):", "https://");
          if (url) {
            insertFormat(`<a href="${url}" target="_blank">`, "</a>");
          }
          break;
      }
    });
  });

  // Fungsi Kirim ke Database Supabase
  async function saveArticle(isPublished) {
    const client = getClient();
    if (!client) {
      alert("Koneksi Supabase belum siap!");
      return;
    }

    if (!postTitle.value.trim() || !postSlug.value.trim() || !postContent.value.trim()) {
      alert("Harap lengkapi Judul, Slug, dan Konten Artikel!");
      return;
    }

    editorAlert.style.display = "none";
    const activeBtn = isPublished ? btnPublish : btnDraft;
    const originalText = activeBtn.innerHTML;
    activeBtn.disabled = true;
    activeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

    const payload = {
      title: postTitle.value.trim(),
      slug: postSlug.value.trim(),
      category: postCategory.value,
      thumbnail_url: postThumbnail.value.trim() || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      summary: postSummary.value.trim(),
      content: postContent.value.trim(),
      is_published: isPublished,
      reactions: { fire: 0, gem: 0, crown: 0, rocket: 0 }
    };

    try {
      const { error } = await client.from("articles").insert([payload]);

      activeBtn.disabled = false;
      activeBtn.innerHTML = originalText;

      if (error) throw error;

      editorAlert.className = "alert-box alert-success";
      if (isPublished) {
        editorAlert.innerHTML = `✓ Artikel berhasil <strong>Diterbitkan Live</strong>! <a href="/blog-detail.html?slug=${payload.slug}" target="_blank" style="color: #fff; text-decoration: underline; font-weight: 800; margin-left: 8px;">Lihat Artikel <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
      } else {
        editorAlert.innerHTML = `✓ Artikel berhasil disimpan sebagai <strong>Draft</strong>.`;
      }
      editorAlert.style.display = "block";

      articleForm.reset();
    } catch (err) {
      activeBtn.disabled = false;
      activeBtn.innerHTML = originalText;
      editorAlert.className = "alert-box alert-error";
      editorAlert.innerText = `Gagal menyimpan artikel: ${err.message}`;
      editorAlert.style.display = "block";
    }
  }

  // Event Submit Publish (Live)
  articleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveArticle(true);
  });

  // Event Klik Draft
  btnDraft.addEventListener("click", () => {
    saveArticle(false);
  });
});