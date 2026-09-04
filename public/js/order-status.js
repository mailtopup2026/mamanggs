document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkOrderBtn");
  const invoiceInput = document.getElementById("invoiceInput");
  const resultCard = document.getElementById("orderResultCard");
  const paymentBox = document.getElementById("paymentInstructionBox");

  const urlParams = new URLSearchParams(window.location.search);
  const invFromUrl = urlParams.get("inv");
  if (invFromUrl) {
    invoiceInput.value = invFromUrl;
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
      if (typeof window.showToast === "function") {
        window.showToast("Masukkan nomor Invoice transaksi dulu bosku!", "warning");
      } else {
        alert("Masukkan nomor Invoice transaksi dulu bosku!");
      }
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
        document.getElementById("resInvoice").innerText = order.invoice;

        const statusBadge = document.getElementById("resStatus");
        statusBadge.className = `status-badge ${order.status.toLowerCase()}`;
        const icon =
          order.status === "SUCCESS"
            ? "fa-circle-check"
            : order.status === "FAILED"
            ? "fa-circle-xmark"
            : "fa-clock";
        statusBadge.innerHTML = `<i class="fa-solid ${icon}"></i> ${order.status}`;

        const detailItems = document.querySelectorAll(".detail-item strong");
        if (detailItems.length >= 4) {
          detailItems[0].innerText = `${order.item_name} (${order.game_title})`;
          detailItems[1].innerText = order.zone_id
            ? `${order.account_id} (${order.zone_id})`
            : order.account_id;
          detailItems[2].innerText = order.payment_method;
          detailItems[3].innerText = `Rp ${Number(order.price).toLocaleString("id-ID")}`;
        }

        // Render instruksi pembayaran jika status masih PENDING
        renderPaymentInstruction(order);

        resultCard.classList.add("show");
      } else {
        if (typeof window.showToast === "function") {
          window.showToast("Nomor invoice tidak ditemukan! Pastikan nomor invoice benar.", "error");
        } else {
          alert("Nomor invoice tidak ditemukan! Pastikan nomor invoice yang Anda masukkan benar.");
        }
        resultCard.classList.remove("show");
        if (paymentBox) paymentBox.style.display = "none";
      }
    } catch (err) {
      console.error(err);
      if (typeof window.showToast === "function") {
        window.showToast("Terjadi kesalahan saat memeriksa transaksi: " + err.message, "error");
      } else {
        alert("Terjadi kesalahan saat memeriksa transaksi: " + err.message);
      }
    } finally {
      checkBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cek Status';
      checkBtn.disabled = false;
    }
  }

  function renderPaymentInstruction(order) {
    if (!paymentBox) return;

    if (order.status !== "PENDING") {
      paymentBox.style.display = "none";
      return;
    }

    const payData = order.payment_data || {};
    const method = (order.payment_method || "").toLowerCase();

    // 1. INSTRUKSI QRIS
    if (method.includes("qris")) {
      const qrContent =
        payData?.payment?.qr_content ||
        payData?.qr_content ||
        payData?.response?.payment?.qr_content;

      if (qrContent) {
        paymentBox.innerHTML = `
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="margin-bottom: 10px; color: #fff;">Pindai Kode QRIS untuk Membayar</h4>
            <div id="qrcode" style="display: inline-block; background: #fff; padding: 12px; border-radius: 8px;"></div>
            <p style="margin-top: 12px; font-size: 13px; color: #aaa;">Gunakan GoPay, OVO, Dana, ShopeePay, atau Mobile Banking apa saja.</p>
          </div>
        `;
        paymentBox.style.display = "block";

        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
          text: qrContent,
          width: 200,
          height: 200,
        });
      } else if (payData?.payment?.url || payData?.url) {
        // Fallback jika berupa tautan pembayaran DOKU
        const payUrl = payData?.payment?.url || payData?.url;
        paymentBox.innerHTML = `
          <div style="text-align: center; margin-top: 15px;">
            <a href="${payUrl}" target="_blank" style="display: inline-block; background: #e63946; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              <i class="fa-solid fa-qrcode"></i> Buka Pembayaran QRIS
            </a>
          </div>
        `;
        paymentBox.style.display = "block";
      }
    }
    // 2. INSTRUKSI VIRTUAL ACCOUNT
    else if (method.includes("virtual account") || method.includes("va")) {
      const vaNumber =
        payData?.payment?.va_number ||
        payData?.va_number ||
        payData?.response?.payment?.va_number ||
        "-";

      paymentBox.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
          <h4 style="margin-bottom: 8px; color: #fff;">Nomor Virtual Account</h4>
          <div style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #48cae4; margin: 10px 0;">${vaNumber}</div>
          <button onclick="navigator.clipboard.writeText('${vaNumber}'); if(typeof window.showToast==='function'){window.showToast('Nomor VA berhasil disalin!','success');}else{alert('Nomor VA berhasil disalin!');}" style="background: rgba(255,255,255,0.15); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">
            <i class="fa-solid fa-copy"></i> Salin Nomor VA
          </button>
        </div>
      `;
      paymentBox.style.display = "block";
    }
  }
});