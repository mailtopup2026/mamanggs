# HANDOFF — MamangGS (website top up game)

Ditulis: 6 Nov 2026. Untuk Claude yang melanjutkan pekerjaan ini.

## Tentang pemilik
- Nama: Rizki (panggil "bro"). Bukan programmer, latar belakang sales.
- Jawab dalam **bahasa Indonesia sederhana, langkah demi langkah**.

## Aturan kerja (wajib)
1. Kerjakan di branch `claude/...`, jangan langsung ke `main`.
2. Tulis rencana dan **tunggu persetujuan** sebelum mengubah kode.
3. UI baru **digambar dulu di kanvas Design**, dicek Rizki, baru dipasang ke kode.
4. Gabungkan PR hanya kalau Rizki bilang **"oke, gabungkan"**.
5. **Jangan pernah** taruh password / secret key di kode. Pakai environment variable di Vercel.
6. File SQL ditaruh di folder `supabase/` dan **tidak dijalankan oleh Claude**. Rizki yang menjalankan di Supabase SQL Editor.
   Fungsi khusus admin harus `revoke ... from public, anon` dan cek `is_admin()`.

## Kondisi repo sekarang
- Website statis di `public/` (HTML + JS biasa + Supabase JS dari CDN), API serverless di `api/`, deploy di **Vercel**, domain `mamanggs.my.id`.
- `public/js/supabase.js` berisi URL + anon key Supabase lama (anon key memang boleh publik).
- **Data Supabase sudah dihapus** (project dipakai untuk hal lain), jadi semua bagian website stuck di "Memuat...".
- `node_modules/` (±1.400 file) ikut ter-commit padahal ada di `.gitignore` → perlu `git rm -r --cached node_modules`.
- `package.json` menunjuk `server.js` yang tidak ada; `api/index.js` berupa Express (sisa lama).
- Tabel yang dipakai kode lama: profiles, orders, manual_id_products, market_posts, articles, manual_games, game_categories, banners, market_likes, market_comments, flash_sales, products, app_settings, market_images, games, promos, transactions. RPC: increment_article_reaction, get_leaderboard_rankings, deduct_user_balance, admin_adjust_balance, add_user_balance.

## ⚠️ Masalah keamanan yang sudah ditemukan
1. **Repo `mailtopup2026/mamanggs` PUBLIC** dan `sync-digiflazz.js` berisi username + production key Digiflazz.
   Sudah disampaikan ke Rizki: ganti key / tarik saldo di Digiflazz, dan pertimbangkan repo jadi private.
   File ini akan dihapus karena Digiflazz tidak dipakai lagi.
2. `api/check-id.js` ada secret key tertulis di kode (baris ±98).
3. `api/doku-callback.js` tidak cek signature DOKU, dan harga order dihitung di browser (`public/js/order.js`, `totalToPay`).
   Ini jadi tidak relevan karena DOKU dan Digiflazz dibuang, tapi **harga pesanan tetap harus diambil dari database** (trigger/fungsi SQL), bukan dari browser.

## Keputusan Rizki (6 Nov 2026)
- **Tidak pakai Digiflazz lagi** (mahal) dan **tidak pakai DOKU** (pengajuan QRIS ribet).
- Pembayaran: **QRIS statis milik Rizki atau transfer bank**, pesanan **diproses manual** oleh Rizki.
- Produk:
  1. **Whiteout Survival**: paket **Frost Star** dan **via login**.
  2. **Game lainnya**: **via login** saja.
- Ingin UI baru yang **cerah, unik, dan modern** (tampilan lama gelap dengan aksen hijau stabilo).

## Rencana yang diusulkan (belum disetujui)
Alur pembeli:
1. Pilih game → pilih paket.
2. Isi data: Frost Star = ID pemain; via login = data login + catatan (login pakai Google/FB/dll.).
3. Isi nomor WhatsApp.
4. Halaman bayar: gambar QRIS + nomor rekening, nominal, nomor invoice.
5. Upload foto bukti transfer (Supabase Storage).
6. Admin cek uang masuk → status "Diproses" → "Selesai". Pembeli cek status pakai nomor invoice + tombol chat WA.
7. Data login pembeli hanya bisa dibaca admin (RLS) dan **dihapus otomatis setelah pesanan selesai**.

Langkah kerja:
1. Bersihkan kode lama (buang Digiflazz, DOKU, check-id, Express, node_modules; hapus semua key dari kode).
2. Buat SQL baru di `supabase/` (game, paket, pesanan, bukti transfer, pengaturan QRIS/rekening, is_admin()). Saran: **project Supabase baru khusus MamangGS**.
3. Gambar desain di kanvas Design: halaman utama, order, bayar, admin pesanan.
4. Halaman admin: kelola game & paket + harga, ganti QRIS & rekening, kelola pesanan.

## Pertanyaan yang BELUM dijawab Rizki
1. Rencana di atas oke?
2. Tema warna: **Candy Arcade** (pastel permen), **Sunny Pop** (kuning-oranye ceria), atau **Clay 3D** (efek tanah liat empuk)? Hijau stabilo lama bisa jadi aksen.
3. Fitur lama mana yang tetap dipakai: Saldo MGS (deposit), FJB Akun, Blog, Leaderboard, Login/daftar member? (Opsi simpel: toko + cek pesanan saja, tanpa akun.)
4. Frost Star Whiteout Survival cukup pakai ID pemain, atau perlu login ke akun pembeli?

**Mulai dari menanyakan 4 hal di atas.** Jangan ubah kode sebelum Rizki setuju.
