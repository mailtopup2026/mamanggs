// ==========================================
  // FITUR REAL AUTO CEK NICKNAME ID GAME
  // ==========================================
  const userIdInput = document.getElementById("userIdInput");
  const zoneIdInput = document.getElementById("zoneIdInput");
  const idCheckSpinner = document.getElementById("idCheckSpinner");
  const nicknameBox = document.getElementById("nicknameBox");

  let checkTimeout = null;

  async function checkNickname() {
    const uid = userIdInput.value.trim();
    const zid = currentGame.hasZone ? zoneIdInput.value.trim() : "";

    if (!uid || (currentGame.hasZone && !zid)) {
      nicknameBox.style.display = "none";
      verifiedNickname = null;
      return;
    }

    if (uid.length < 4) return;

    idCheckSpinner.style.display = "block";
    nicknameBox.style.display = "none";

    try {
      // Panggil Serverless Function Proxy Vercel
      const queryParams = new URLSearchParams({
        game: currentGame.code,
        id: uid,
        zone: zid
      });

      const res = await fetch(`/api/check-id?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "User ID / Server tidak ditemukan.");
      }

      verifiedNickname = data.name;
      nicknameBox.className = "nickname-result-box";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>Nickname Akun: <strong>${data.name}</strong> (Terverifikasi)</span>
      `;
      nicknameBox.style.display = "flex";
    } catch (err) {
      console.error("Cek ID Error:", err);
      nicknameBox.className = "nickname-result-box error";
      nicknameBox.innerHTML = `
        <i class="fa-solid fa-circle-xmark"></i>
        <span>${err.message || "User ID / Zone ID tidak valid."}</span>
      `;
      nicknameBox.style.display = "flex";
      verifiedNickname = null;
    } finally {
      idCheckSpinner.style.display = "none";
    }
  }