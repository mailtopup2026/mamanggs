import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const payload = req.body;

    // Ambil invoice dan status pembayaran dari notifikasi DOKU
    const invoiceNumber = payload?.order?.invoice_number || payload?.invoice_number;
    const transactionStatus = payload?.transaction?.status || payload?.status;

    if (!invoiceNumber) {
      return res.status(400).json({ message: "Invoice number not found in payload" });
    }

    // Jika pembayaran sukses di DOKU
    if (transactionStatus === "SUCCESS" || transactionStatus === "SUCCESSFUL" || payload?.order?.status === "SUCCESS") {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "SUCCESS",
          payment_data: payload
        })
        .ilike("invoice", invoiceNumber);

      if (error) {
        console.error("Gagal update status Supabase:", error);
        return res.status(500).json({ error: error.message });
      }
    }

    // Wajib respons status 200 OK ke DOKU agar tidak dikirim notifikasi berulang
    return res.status(200).json({ status: "OK" });
  } catch (err) {
    console.error("Callback Error:", err);
    return res.status(500).json({ error: err.message });
  }
}