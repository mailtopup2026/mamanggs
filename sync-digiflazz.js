import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 1. KREDENSIAL SUPABASE
const SUPABASE_URL = 'https://zggxbkjokgzauclbbbaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ3hia2pva2d6YXVjbGJiYmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTQxODksImV4cCI6MjEwMzQ5MDE4OX0.clPCPTXun0-bLiPGNJEgMP4HQIQC5WOigZ2YGfyrDXI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. KREDENSIAL PRODUCTION DIGIFLAZZ RESMI
const USERNAME = 'nesikeDRyQ1o';
const PRODUCTION_KEY = '3188d7a5-a341-5608-916f-018bcd9dd9db';

// Helper Mapping Brand ke game_code ringkas
function getGameCode(brand = "") {
  const b = brand.toUpperCase();
  if (b.includes("MOBILE LEGEND")) return "mlbb";
  if (b.includes("FREE FIRE")) return "ff";
  if (b.includes("PUBG")) return "pubg";
  if (b.includes("GENSHIN")) return "genshin";
  if (b.includes("VALORANT")) return "valorant";
  if (b.includes("HONOR OF KINGS")) return "hok";
  if (b.includes("POINT BLANK")) return "pb";
  if (b.includes("WHITEOUT")) return "whiteout";
  if (b.includes("STEAM")) return "steam";
  return brand.toLowerCase().replace(/\s+/g, '-');
}

async function syncProductionProducts() {
  console.log('🚀 Memulai penarikan data produk resmi Digiflazz (Production)...');

  // Buat Signature MD5
  const sign = crypto.createHash('md5').update(USERNAME + PRODUCTION_KEY + 'pricelist').digest('hex');

  const payload = {
    cmd: 'prepaid',
    username: USERNAME,
    sign: sign
  };

  try {
    const response = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      console.error('❌ Respon dari Digiflazz:', result);
      return;
    }

    console.log(`📦 Berhasil menerima ${result.data.length} total produk dari Digiflazz.`);

    // Filter produk kategori Games yang aktif
    const gameProducts = result.data.filter(item => 
      item.category === 'Games' && item.buyer_product_status === true && item.seller_product_status === true
    );

    console.log(`🎮 Terdeteksi ${gameProducts.length} produk Game aktif siap jual.`);

    // Format data murni sesuai skema Supabase yang terverifikasi
    const formattedProducts = gameProducts.map(item => {
      const basePrice = Number(item.price);
      
      // Margin Keuntungan
      let margin = 0;
      if (basePrice < 15000) {
        margin = 350;
      } else if (basePrice < 50000) {
        margin = 1000;
      } else if (basePrice < 150000) {
        margin = 2500;
      } else {
        margin = 5000;
      }

      return {
        buyer_sku_code: item.buyer_sku_code,
        game_code: getGameCode(item.brand),
        product_name: item.product_name,
        category: item.category,
        brand: item.brand,
        price_original: basePrice, // Sesuai dengan kolom Supabase
        price_sell: basePrice + margin,
        buyer_product_status: item.buyer_product_status,
        seller_product_status: item.seller_product_status,
        unlimited_stock: Boolean(item.unlimited_stock),
        updated_at: new Date().toISOString()
      };
    });

    console.log('⚡ Mengunggah data produk ke Supabase...');
    const { error } = await supabase
      .from('products')
      .upsert(formattedProducts, { onConflict: 'buyer_sku_code' });

    if (error) {
      console.error('❌ Gagal menyimpan ke Supabase:', error.message);
    } else {
      console.log('✅ SUKSES 100%! Semua produk game resmi berhasil masuk ke Supabase.');
    }

  } catch (err) {
    console.error('❌ Terjadi kesalahan jaringan / server:', err.message);
  }
}

syncProductionProducts();