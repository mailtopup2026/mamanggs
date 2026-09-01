const crypto = require("crypto");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, amount, customerPhone, customerName } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: "Parameter tidak lengkap" });
    }

    const clientId = process.env.DOKU_CLIENT_ID;
    const secretKey = process.env.DOKU_SECRET_KEY;
    const baseUrl = process.env.DOKU_API_URL || "https://api.doku.com";

    const targetPath = "/checkout/v1/payment";
    const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const requestId = `REQ-${Date.now()}`;

    const requestBody = {
      order: {
        amount: parseInt(amount, 10),
        invoice_number: orderId,
        currency: "IDR",
        callback_url: `https://mamanggs.my.id/order-status.html?inv=${orderId}`
      },
      payment: {
        payment_due_date: 60
      },
      customer: {
        name: customerName || "Pelanggan MamangGS",
        phone: customerPhone || "081234567890",
        email: "customer@mamanggs.my.id"
      }
    };

    const jsonBody = JSON.stringify(requestBody);

    const digest = crypto.createHash("sha256").update(jsonBody, "utf8").digest("base64");

    const signatureComponent = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${requestTimestamp}`,
      `Request-Target:${targetPath}`,
      `Digest:${digest}`,
    ].join("\n");

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureComponent)
      .digest("base64");

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

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gagal membuat tagihan DOKU Checkout",
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};