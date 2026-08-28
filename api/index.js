const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup koneksi ke Supabase Database
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Endpoint: Simpan Order ke Database Supabase
app.post('/api/order/create', async (req, res) => {
  try {
    const { userId, serverId, gameTitle, item, paymentMethod, buyerWhatsapp } = req.body;

    if (!userId || !item || !buyerWhatsapp) {
      return res.status(400).json({ status: false, message: 'Data pesanan tidak lengkap' });
    }

    const invoiceId = `TPM-${Date.now()}`;
    const cleanPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;

    // Simpan ke Supabase jika konfigurasi tersedia
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            invoice_id: invoiceId,
            user_id: userId,
            server_id: serverId || '-',
            game_code: gameTitle,
            item_name: item.name,
            item_code: item.code || 'CODE_GENERIC',
            price_total: cleanPrice,
            payment_method: paymentMethod,
            payment_status: 'UNPAID',
            delivery_status: 'PENDING',
            buyer_whatsapp: buyerWhatsapp
          }
        ]);

      if (error) {
        console.error('Supabase Error:', error);
      }
    }

    res.json({
      status: true,
      data: {
        invoice: invoiceId,
        game: gameTitle,
        item: item.name,
        total: cleanPrice,
        paymentMethod: paymentMethod,
        buyer_wa: buyerWhatsapp
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});

// 2. Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: true, message: 'Server topupmamang is running perfectly!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
