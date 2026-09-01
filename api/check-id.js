export default async function handler(req, res) {
  // CORS Header
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

  const gameCode = game.toLowerCase().trim();
  const cleanId = id.toString().trim();
  const cleanZone = zone ? zone.toString().trim() : "";

  // 1. FILTER KEAMANAN KETAT: Blokir input huruf untuk game yang ID-nya wajib Angka
  const numberOnlyGames = ["mlbb", "ml", "ff", "freefire", "whiteout", "wos", "pubg", "codm", "hok", "aov"];
  if (numberOnlyGames.includes(gameCode)) {
    if (!/^\d+$/.test(cleanId)) {
      return res.status(404).json({ 
        success: false, 
        message: "Format ID salah. User ID game ini hanya boleh berisi angka." 
      });
    }
  }

  try {
    let nickname = null;

    // 2. MOBILE LEGENDS
    if (gameCode === "mlbb" || gameCode === "ml") {
      if (!cleanZone) return res.status(400).json({ success: false, message: "Zone ID wajib diisi." });

      // Coba Gateway 1
      try {
        const mlRes = await fetch(
          `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(cleanId)}&zone=${encodeURIComponent(cleanZone)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          if (mlData?.success && mlData?.name) nickname = mlData.name;
        }
      } catch (e) {}

      // Coba Gateway 2 (Codashop API)
      if (!nickname) {
        try {
          const codaRes = await fetch("https://order-sg.codashop.com/initPayment.action", {
            method: "POST",
            headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
            body: JSON.stringify({
              "voucherPricePoint.id": 25653, "voucherPricePoint.price": 1579, "voucherPricePoint.variablePrice": 0,
              "user.userId": cleanId, "user.zoneId": cleanZone, "voucherTypeName": "MOBILE_LEGENDS", "shopLang": "id_ID"
            })
          });
          if (codaRes.ok) {
            const codaData = await codaRes.json();
            if (codaData?.confirmationFields?.username) nickname = decodeURIComponent(codaData.confirmationFields.username);
          }
        } catch (e) {}
      }
    }

    // 3. FREE FIRE
    else if (gameCode === "ff" || gameCode === "freefire") {
      try {
        const ffRes = await fetch(
          `https://api.isan.eu.org/nickname/ff?id=${encodeURIComponent(cleanId)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (ffRes.ok) {
          const ffData = await ffRes.json();
          if (ffData?.success && ffData?.name) nickname = ffData.name;
        }
      } catch (e) {}
    }

    // 4. WHITEOUT SURVIVAL (WOS)
    else if (gameCode === "whiteout" || gameCode === "wos") {
      try {
        // Tembak API penukaran Gift Code resmi dari Century Games
        const wosRes = await fetch("https://wos-giftcode.centurygame.com/api/player", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Origin": "https://wos-giftcode.centurygame.com",
            "Referer": "https://wos-giftcode.centurygame.com/"
          },
          body: new URLSearchParams({
            fid: cleanId,
            time: Date.now().toString()
          })
        });

        if (wosRes.ok) {
          const wosData = await wosRes.json();
          // Jika sukses, API merespon code: 0
          if (wosData?.code === 0 && wosData?.data?.nickname) {
            nickname = `${wosData.data.nickname} (State #${wosData.data.kid || "-"})`;
          }
        }
      } catch (e) {
        console.error("WOS Verify Error:", e);
      }
    }

    // 5. PUBG MOBILE
    else if (gameCode === "pubg") {
      try {
        const pubgRes = await fetch(
          `https://api.isan.eu.org/nickname/pubg?id=${encodeURIComponent(cleanId)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (pubgRes.ok) {
          const pubgData = await pubgRes.json();
          if (pubgData?.success && pubgData?.name) nickname = pubgData.name;
        }
      } catch (e) {}
    }

    // 6. CALL OF DUTY MOBILE
    else if (gameCode === "codm") {
      try {
        const codaRes = await fetch("https://order-sg.codashop.com/initPayment.action", {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
          body: JSON.stringify({
            "voucherPricePoint.id": 46114, "voucherPricePoint.price": 10000, "voucherPricePoint.variablePrice": 0,
            "user.userId": cleanId, "voucherTypeName": "CALL_OF_DUTY", "shopLang": "id_ID"
          })
        });
        if (codaRes.ok) {
          const codaData = await codaRes.json();
          if (codaData?.confirmationFields?.username) nickname = decodeURIComponent(codaData.confirmationFields.username);
        }
      } catch (e) {}
    }

    // 7. GENSHIN IMPACT
    else if (gameCode === "genshin") {
      if (!cleanZone) return res.status(400).json({ success: false, message: "Pilih Server (Zone) terlebih dahulu." });
      try {
        const codaRes = await fetch("https://order-sg.codashop.com/initPayment.action", {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
          body: JSON.stringify({
            "voucherPricePoint.id": 116054, "voucherPricePoint.price": 16000, "voucherPricePoint.variablePrice": 0,
            "user.userId": cleanId, "user.zoneId": cleanZone, "voucherTypeName": "GENSHIN_IMPACT", "shopLang": "id_ID"
          })
        });
        if (codaRes.ok) {
          const codaData = await codaRes.json();
          if (codaData?.confirmationFields?.username) nickname = decodeURIComponent(codaData.confirmationFields.username);
        }
      } catch (e) {}
    }

    // 8. HONOR OF KINGS / AOV
    else if (gameCode === "hok" || gameCode === "aov") {
      try {
        const apiRes = await fetch(
          `https://api.isan.eu.org/nickname/${gameCode}?id=${encodeURIComponent(cleanId)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData?.success && apiData?.name) nickname = apiData.name;
        }
      } catch (e) {}
    }

    // ==========================================
    // EVALUASI AKHIR (ZERO FALSE-VERIFICATION)
    // ==========================================
    
    // Jika Nickname ASLI berhasil didapatkan
    if (nickname) {
      return res.status(200).json({
        success: true,
        name: nickname
      });
    } 
    
    // Jika tidak didapatkan (Gagal API / Game tidak mensupport pengecekan otomatis)
    return res.status(404).json({
      success: false,
      message: "ID Akun tidak ditemukan / tidak dapat diverifikasi. Harap pastikan ID benar."
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server verifikasi sedang sibuk. Pastikan ID Anda benar sebelum membayar."
    });
  }
}