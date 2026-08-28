document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah user sudah login
  const storedUser = localStorage.getItem("mgs_user");
  if (!storedUser) {
    alert("Silakan login terlebih dahulu untuk mengakses Dashboard!");
    window.location.href = "/auth/login.html";
    return;
  }

  const user = JSON.parse(storedUser);

  // Tunggu client Supabase aktif
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      loadUserProfile(user.id);
      loadOrderHistory(user.id);
    }
  }, 100);

  // Load Profil & Saldo dari Tabel profiles
  async function loadUserProfile(userId) {
    try {
      const { data, error } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        document.getElementById("profileName").innerText = data.full_name || "Member MamangGS";
        document.getElementById("profileEmail").innerText = data.email || user.email;
        
        const balance = Number(data.balance || 0).toLocaleString("id-ID");
        document.getElementById("walletBalance").innerText = `Rp ${balance}`;

        const roleBadge = document.getElementById("profileRole");
        roleBadge.innerText = (data.role || "MEMBER").toUpperCase();
        if (data.role === "reseller") roleBadge.classList.add("reseller");
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err.message);
    }
  }

  // Load Riwayat Pesanan dari Tabel orders
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
            <td><strong>${ord.invoice}</strong></td>
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
      console.error("Gagal memuat riwayat transaksi:", err.message);
    }
  }

  // Handler Tombol Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      if (window.supabase) await window.supabase.auth.signOut();
      localStorage.removeItem("mgs_user");
      window.location.href = "/auth/login.html";
    }
  });

  // Handler Deposit Saldo Sederhana
  document.getElementById("btnDeposit").addEventListener("click", () => {
    alert("Fitur Top-Up Saldo Otomatis QRIS akan aktif bersama integrasi Payment Gateway!");
  });
});