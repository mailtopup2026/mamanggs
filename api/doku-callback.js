import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper Fungsi Tembak Transaksi ke DigiFlazz
async function orderDigiflazz(order) {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY || process.env.DIGIFLAZZ_KEY;
  const isDev = process.env.DIGIFLAZZ_MODE === "development";
  const endpoint = "https://api.digiflazz.com/v1/transaction";

  // Signature DigiFlazz: md5(username + apiKey + ref_id)
  const sign = crypto
    .createHash("md5")
    .update(`${username}${apiKey}${order.invoice}`)
    .digest("hex");

  // Format Customer ID: jika ada Zone ID (seperti MLBB: ID+ZoneID)
  const customerNo = order.zone_id 
    ? `${order.account_id}${order.zone_id}` 
    : `${order.account_id}`;

  const payload = {
    username: username,
    buyer_sku_code: order.sku_code || order.item_name,
    customer_no: customerNo,
    ref_id: order.invoice,
    sign: sign,
    testing: isDev
  };

  console.log("Mengirim request ke DigiFlazz:", payload);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return await res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    console.log("DOKU CALLBACK PAYLOAD:", JSON.stringify(body));

    // Ekstraksi Invoice & Status dari balasan DOKU
    const invoiceNumber = 
      body?.order?.invoice_number || 
      body?.invoice_number || 
      body?.orderId || 
      body?.transaction?.invoice_number;

    const trxStatus = (
      body?.transaction?.status || 
      body?.order?.status || 
      body?.status || 
      ""
    ).toUpperCase();

    if (!invoiceNumber) {
      console.warn("Callback DOKU diterima tanpa invoice number");
      return res.status(200).json({ status: "IGNORED_NO_INVOICE" });
    }

    const isSuccess = 
      trxStatus === "SUCCESS" || 
      trxStatus === "SUCCESSFUL" || 
      trxStatus === "PAID" || 
      trxStatus === "SETTLED";

    if (isSuccess) {
      // 1. Ambil data pesanan dari Supabase
      const { data: order, error: findError } = await supabase
        .from("orders")
        .select("*")
        .ilike("invoice", invoiceNumber.trim())
        .maybeSingle();

      if (findError || !order) {
        console.error("Order tidak ditemukan di Supabase:", invoiceNumber);
        return res.status(200).json({ status: "ORDER_NOT_FOUND" });
      }

      // Jika pesanan belum diproses (masih PENDING)
      if (order.status !== "SUCCESS") {
        // A. CABANG TRANSAKSI: DEPOSIT SALDO MGS (DEP-)
        if (invoiceNumber.startsWith("DEP-") && order.user_id) {
          try {
            const { error: balanceErr } = await supabase.rpc("add_user_balance", {
              user_uuid: order.user_id,
              amount: Number(order.price)
            });

            if (balanceErr) throw balanceErr;

            await supabase
              .from("orders")
              .update({
                status: "SUCCESS",
                payment_data: body
              })
              .ilike("invoice", invoiceNumber.trim());

            console.log(`Deposit ${invoiceNumber} berhasil! Saldo user ${order.user_id} bertambah Rp ${order.price}`);
          } catch (depositErr) {
            console.error("Gagal menambahkan saldo user:", depositErr);
          }
        } 
        // B. CABANG TRANSAKSI: TOP-UP GAME (MGS-)
        else {
          let digiResult = null;
          let finalStatus = "PROCESSING";

          try {
            digiResult = await orderDigiflazz(order);
            console.log("DigiFlazz Response:", digiResult);

            const digiStatus = digiResult?.data?.status;
            if (digiStatus === "Sukses") {
              finalStatus = "SUCCESS";
            } else if (digiStatus === "Gagal") {
              finalStatus = "FAILED";
            }
          } catch (dfErr) {
            console.error("Error panggil DigiFlazz API:", dfErr);
          }

          // Update status pesanan di database Supabase
          await supabase
            .from("orders")
            .update({
              status: finalStatus,
              payment_data: body,
              provider_response: digiResult
            })
            .ilike("invoice", invoiceNumber.trim());

          console.log(`Pesanan ${invoiceNumber} berhasil diperbarui ke status: ${finalStatus}`);
        }
      }
    }

    // Wajib beri respons 200 OK ke DOKU
    return res.status(200).json({ status: "OK" });
  } catch (err) {
    console.error("DOKU Callback Handler Error:", err);
    return res.status(500).json({ error: err.message });
  }
}