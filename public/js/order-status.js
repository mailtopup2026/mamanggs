// ==========================================
// MANDIRI CYBER TOAST (TANPA DEPENDENSI)
// ==========================================
function triggerCyberToast(message, type = "warning") {
  let container = document.getElementById("mgsToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "mgsToastContainer";
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 20px;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const borderColors = {
    warning: "rgba(245, 158, 11, 0.6)",
    error: "rgba(239, 68, 68, 0.6)",
    success: "rgba(16, 185, 129, 0.6)"
  };

  const iconClasses = {
    warning: "fa-triangle-exclamation",
    error: "fa-circle-xmark",
    success: "fa-circle-check"
  };

  const iconColors = {
    warning: "#f59e0b",
    error: "#ef4444",
    success: "#10b981"
  };

  const toast = document.createElement("div");
  toast.style.cssText = `
    pointer-events: auto;
    min-width: 260px;
    max-width: 350px;
    background: #0f172a;
    border: 1px solid ${borderColors[type] || borderColors.warning};
    border-radius: 12px;
    padding: 12px 16px;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.85);
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
  `;

  toast.innerHTML = `
    <i class="fa-solid ${iconClasses[type] || iconClasses.warning}" style="font-size: 1.2rem; color: ${iconColors[type] || iconColors.warning}; flex-shrink: 0;"></i>
    <div style="line-height: 1.4;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// LOGIKA LACAK STATUS PESANAN
// ==========================================
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
      triggerCyberToast("Masukkan nomor Invoice transaksi dulu bosku!", "warning");
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

        renderPaymentInstruction(order);
        resultCard.classList.add("show");
      } else {
        triggerCyberToast("Nomor invoice tidak ditemukan! Pastikan nomornya benar.", "error");
        resultCard.classList.remove("show");
        if (paymentBox) paymentBox.style.display = "none";
      }
    } catch (err) {
      console.error(err);
      triggerCyberToast("Terjadi kesalahan saat memeriksa transaksi: " + err.message, "error");
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

    // QRIS
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
    // VIRTUAL ACCOUNT
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
          <button id="btnCopyVA" style="background: rgba(255,255,255,0.15); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">
            <i class="fa-solid fa-copy"></i> Salin Nomor VA
          </button>
        </div>
      `;
      paymentBox.style.display = "block";

      document.getElementById("btnCopyVA")?.addEventListener("click", () => {
        navigator.clipboard.writeText(vaNumber);
        triggerCyberToast("Nomor VA berhasil disalin!", "success");
      });
    }
  }
});