const crypto = require("crypto");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, amount, paymentMethod, customerName, customerPhone } = req.body;

  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ error: "Parameter tidak lengkap" });
  }

  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  const baseUrl = process.env.DOKU_API_URL || "https://api-sandbox.doku.com";

  // INI YANG KITA UBAH: Menggunakan endpoint resmi DOKU Checkout
  const targetPath = "/checkout/v1/payment"; 
  
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Format Body standar DOKU Checkout
  const requestBody = {
    order: {
      amount: parseInt(amount, 10),
      invoice_number: orderId,
      currency: "IDR",
      callback_url: "https://mamanggs.my.id/order-status.html?inv=" + orderId // URL kembali setelah bayar
    },
    payment: {
      payment_due_date: 60 // Expired dalam 60 menit
    },
    customer: {
      name: customerName || "Pelanggan MamangGS",
      phone: customerPhone || "081234567890"
    }
  };

  const jsonBody = JSON.stringify(requestBody);

  // 1. Generate Digest
  const digest = crypto.createHash("sha256").update(jsonBody, "utf8").digest("base64");

  // 2. Generate Signature Component
  const signatureComponent = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${targetPath}`,
    `Digest:${digest}`,
  ].join("\n");

  // 3. Generate HMAC-SHA256 Signature
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureComponent)
    .digest("base64");

  try {
    const response = await fetch(`${baseUrl}${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": `HMACSHA256=${signature}`,
      },
      body: jsonBody,
    });

    const result = await response.json();

    // DOKU merespons selain 200 OK
    if (!response.ok || (result.message && result.message[0] !== "SUCCESS")) {
      return res.status(response.status || 400).json({
        error: "Gagal membuat tagihan DOKU",
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.response,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};