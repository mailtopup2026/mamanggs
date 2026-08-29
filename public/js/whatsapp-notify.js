// Konfigurasi WhatsApp Gateway (Ganti FONNTE_API_TOKEN dengan token Fonnte milikmu)
const FONNTE_API_TOKEN = "TOKEN_FONNTE_KAMU_DISINI";

/**
 * Format nomor HP ke standar internasional Indonesia (62xxx)
 */
function formatWhatsAppNumber(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  } else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }
  return clean;
}

/**
 * Kirim Pesan WhatsApp via Fonnte Gateway
 */
async function sendWhatsAppNotification(targetPhone, message) {
  const target = formatWhatsAppNumber(targetPhone);
  if (!target) return false;

  // Jika token belum disetting, kita log di console browser saja sebagai simulasi
  if (!FONNTE_API_TOKEN || FONNTE_API_TOKEN === "TOKEN_FONNTE_KAMU_DISINI") {
    console.warn("⚠️ Token WhatsApp Gateway belum diisi. Simulasi pesan terkirim ke:", target);
    console.log("Isi Pesan:\n", message);
    return true;
  }

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target: target,
        message: message
      })
    });

    const result = await response.json();
    return result.status === true;
  } catch (err) {
    console.error("Gagal mengirim WhatsApp:", err);
    return false;
  }
}

/**
 * Template Pesan Sukses / Invoice MamangGS
 */
window.notifyOrderSuccess = async (order) => {
  if (!order || !order.whatsapp) return;

  const targetAcc = order.zone_id ? `${order.account_id} (${order.zone_id})` : order.account_id;
  const priceFormatted = Number(order.price || 0).toLocaleString("id-ID");

  const message = 
`✅ *TRANSAKSI BERHASIL - MAMANGGS*
Halo gamers, pesanan Anda telah berhasil diproses oleh sistem!

📄 *Detail Pesanan:*
• *No. Invoice:* ${order.invoice}
• *Game:* ${order.game_title || order.game_code}
• *Item:* ${order.item_name}
• *ID Akun:* ${targetAcc}
• *Total Bayar:* Rp ${priceFormatted}
• *Metode:* ${order.payment_method}
• *Status:* SUCCESS

Cek status real-time pesanan Anda di:
🔗 https://mamanggs.vercel.app/order-status.html?inv=${order.invoice}

Terima kasih telah mempercayakan top up game di *MamangGS*! Happy Gaming! 🎮🔥`;

  return await sendWhatsAppNotification(order.whatsapp, message);
};