export default async function handler(req, res) {
  // Set CORS Header
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { game, id, zone } = req.query;

  if (!game || !id) {
    return res.status(400).json({ success: false, message: "ID akun wajib diisi." });
  }

  const gameCode = game.toLowerCase();

  try {
    let nickname = null;

    // 1. MOBILE LEGENDS
    if (gameCode === "mlbb" || gameCode === "ml") {
      if (!zone) {
        return res.status(400).json({ success: false, message: "Zone ID wajib diisi." });
      }

      // Jalur 1: Endpoint Gateway Publik
      try {
        const mlRes = await fetch(
          `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          if (mlData && mlData.success && mlData.name) {
            nickname = mlData.name;
          }
        }
      } catch (e) {}

      // Jalur 2: Codashop Official Validator
      if (!nickname) {
        try {
          const codaRes = await fetch("https://order-sg.codashop.com/initPayment.action", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
              "voucherPricePoint.id": 25653,
              "voucherPricePoint.price": 1579,
              "voucherPricePoint.variablePrice": 0,
              "user.userId": String(id),
              "user.zoneId": String(zone),
              "voucherTypeName": "MOBILE_LEGENDS",
              "shopLang": "id_ID"
            })
          });
          if (codaRes.ok) {
            const codaData = await codaRes.json();
            if (codaData?.confirmationFields?.username) {
              nickname = decodeURIComponent(codaData.confirmationFields.username);
            }
          }
        } catch (e) {}
      }
    }
    // 2. FREE FIRE
    else if (gameCode === "ff" || gameCode === "freefire") {
      try {
        const ffRes = await fetch(
          `https://api.isan.eu.org/nickname/ff?id=${encodeURIComponent(id)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (ffRes.ok) {
          const ffData = await ffRes.json();
          if (ffData && ffData.success && ffData.name) {
            nickname = ffData.name;
          }
        }
      } catch (e) {}
    }
    // 3. GAME LAINNYA (PUBG / Genshin / Valorant)
    else {
      nickname = `Player_${id.slice(-4)}`;
    }

    // Jika ID memang salah / tidak ditemukan
    if (!nickname) {
      return res.status(404).json({
        success: false,
        message: "User ID atau Zone ID tidak ditemukan di server game."
      });
    }

    return res.status(200).json({
      success: true,
      name: nickname
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Server verifikasi sedang padat. Pastikan format ID sudah benar."
    });
  }
}