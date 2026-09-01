import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
// Gunakan Service Role Key jika ada agar bypass RLS, fallback ke Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    console.log("DOKU CALLBACK PAYLOAD:", JSON.stringify(body));

    // Ekstraksi nomor invoice dari berbagai kemungkinan field DOKU
    const invoiceNumber = 
      body?.order?.invoice_number || 
      body?.invoice_number || 
      body?.orderId || 
      body?.transaction?.invoice_number;

    // Ekstraksi status transaksi
    const trxStatus = (
      body?.transaction?.status || 
      body?.order?.status || 
      body?.status || 
      ""
    ).toUpperCase();

    if (!invoiceNumber) {
      console.warn("Callback DOKU diterima tanpa invoice number:", body);
      return res.status(200).json({ status: "IGNORED_NO_INVOICE" });
    }

    // Periksa apakah status menyatakan sukses / lunas
    const isSuccess = 
      trxStatus === "SUCCESS" || 
      trxStatus === "SUCCESSFUL" || 
      trxStatus === "PAID" || 
      trxStatus === "SETTLED";

    if (isSuccess) {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "SUCCESS",
          payment_data: body
        })
        .ilike("invoice", invoiceNumber.trim())
        .select();

      if (error) {
        console.error("Gagal update status di Supabase:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log(`Pesanan ${invoiceNumber} berhasil diupdate ke SUCCESS!`);
    }

    // DOKU mewajibkan respons status 200 OK
    return res.status(200).json({ status: "OK" });
  } catch (err) {
    console.error("DOKU Callback Exception:", err);
    return res.status(500).json({ error: err.message });
  }
}