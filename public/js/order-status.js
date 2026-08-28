document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkOrderBtn");
  const invoiceInput = document.getElementById("invoiceInput");
  const resultCard = document.getElementById("orderResultCard");

  // Periksa apakah ada invoice yang dikirim lewat URL (?inv=...)
  const urlParams = new URLSearchParams(window.location.search);
  const invFromUrl = urlParams.get("inv");
  if (invFromUrl) {
    invoiceInput.value = invFromUrl;
    // Tunggu supabase client siap
    const checkTimer = setInterval(() => {
      if (window.supabase) {
        clearInterval(checkTimer);
        fetchOrderStatus(invFromUrl);
      }
    }, 100);
  }

  checkBtn.addEventListener("click", () => {
    const invoice = invoiceInput.value.trim();
    if (!invoice) {
      alert("Silakan masukkan nomor invoice transaksi kamu!");
      return;
    }
    fetchOrderStatus(invoice);
  });

  async function fetchOrderStatus(invoice) {
    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mencari...';
    checkBtn.disabled = true;

    try {
      if (!window.supabase) throw new Error("Koneksi Supabase belum siap.");

      const { data: order, error } = await window.supabase
        .from("orders")
        .select("*")
        .ilike("invoice", invoice)
        .maybeSingle();

      if (error) throw error;

      if (order) {
        // Tampilkan data hasil pencarian
        document.getElementById("resInvoice").innerText = order.invoice;
        
        const statusBadge = document.getElementById("resStatus");
        statusBadge.className = `status-badge ${order.status.toLowerCase()}`;
        const icon = order.status === "SUCCESS" ? "fa-circle-check" : (order.status === "FAILED" ? "fa-circle-xmark" : "fa-clock");
        statusBadge.innerHTML = `<i class="fa-solid ${icon}"></i> ${order.status}`;

        // Render detail produk
        const detailItems = document.querySelectorAll(".detail-item strong");
        if (detailItems.length >= 4) {
          detailItems[0].innerText = `${order.item_name} (${order.game_title})`;
          detailItems[1].innerText = order.zone_id ? `${order.account_id} (${order.zone_id})` : order.account_id;
          detailItems[2].innerText = order.payment_method;
          detailItems[3].innerText = `Rp ${Number(order.price).toLocaleString("id-ID")}`;
        }

        resultCard.classList.add("show");
      } else {
        alert("Nomor invoice tidak ditemukan! Pastikan nomor invoice yang Anda masukkan benar.");
        resultCard.classList.remove("show");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memeriksa transaksi: " + err.message);
    } finally {
      checkBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cek Status';
      checkBtn.disabled = false;
    }
  }
});