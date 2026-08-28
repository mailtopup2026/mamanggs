document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("mgs_user");
  if (!storedUser) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = JSON.parse(storedUser);

  // Pasang data awal dari metadata login agar tidak menunggu
  const initialName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
  document.getElementById("profileName").innerText = initialName;
  document.getElementById("profileEmail").innerText = user.email || "";

  // Sinkronisasi data real-time dengan Supabase
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      loadUserProfile(user.id);
      loadOrderHistory(user.id);
    }
  }, 100);

  // Ambil saldo dan role dari tabel profiles
  async function loadUserProfile(userId) {
    try {
      const { data, error } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.full_name) document.getElementById("profileName").innerText = data.full_name;
        if (data.email) document.getElementById("profileEmail").innerText = data.email;

        const balance = Number(data.balance || 0).toLocaleString("id-ID");
        document.getElementById("walletBalance").innerText = `Rp ${balance}`;

        const rolePill = document.getElementById("profileRole");
        const role = (data.role || "MEMBER").toUpperCase();
        rolePill.innerText = role;
        if (data.role === "reseller") rolePill.classList.add("reseller");
      }
    } catch (err) {
      console.error("Gagal sinkron profil:", err.message);
    }
  }

  // Ambil riwayat pesanan
  async function loadOrderHistory(userId) {
    const tableBody = document.getElementById("orderHistoryBody");
    const emptyState = document.getElementById("historyEmptyState");

    try {
      const { data: orders, error } = await window.supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (orders && orders.length > 0) {
        tableBody.innerHTML = "";
        emptyState.style.display = "none";
        document.getElementById("totalOrdersCount").innerText = orders.length;

        orders.forEach((ord) => {
          const row = document.createElement("tr");
          const date = new Date(ord.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const price = Number(ord.price).toLocaleString("id-ID");

          row.innerHTML = `
            <td><strong style="color: var(--accent-red);">${ord.invoice}</strong></td>
            <td>${ord.game_title}</td>
            <td>${ord.item_name}</td>
            <td>Rp ${price}</td>
            <td><span class="status-badge ${ord.status.toLowerCase()}">${ord.status}</span></td>
            <td>${date}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = "";
        emptyState.style.display = "block";
      }
    } catch (err) {
      console.error("Gagal load pesanan:", err.message);
    }
  }

  // Tombol Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      if (window.supabase) await window.supabase.auth.signOut();
      localStorage.removeItem("mgs_user");
      window.location.href = "/";
    }
  });

  // Tombol Isi Saldo
  document.getElementById("btnDeposit").addEventListener("click", () => {
    alert("Fitur Deposit Saldo Instan QRIS akan aktif di Step Integrasi Payment Gateway!");
  });
});