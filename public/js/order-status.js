document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkOrderBtn");
  const invoiceInput = document.getElementById("invoiceInput");
  const resultCard = document.getElementById("orderResultCard");

  // Periksa apakah ada invoice yang dikirim lewat URL (contoh: ?inv=MGS12345)
  const urlParams = new URLSearchParams(window.location.search);
  const invFromUrl = urlParams.get("inv");
  if (invFromUrl) {
    invoiceInput.value = invFromUrl;
    fetchOrderStatus(invFromUrl);
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
      // Panggil backend API yang ada di serverless
      const response = await fetch(`/api/check-order/${encodeURIComponent(invoice)}`);
      const result = await response.json();

      if (result.success) {
        document.getElementById("resInvoice").innerText = result.data.invoice;
        document.getElementById("resStatus").innerHTML = '<i class="fa-solid fa-clock"></i> ' + result.data.status;
        resultCard.classList.add("show");
      } else {
        alert(result.message || "Pesanan tidak ditemukan!");
        resultCard.classList.remove("show");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memeriksa transaksi. Coba lagi!");
    } finally {
      checkBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cek Status';
      checkBtn.disabled = false;
    }
  }
});