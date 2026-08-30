// ===================================================
// MAMANGGS - SUPABASE CLIENT INITIALIZATION
// ===================================================
const SUPABASE_URL = "https://zggxbkjokgzauclbbbaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ3hia2pva2d6YXVjbGJiYmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTQxODksImV4cCI6MjEwMzQ5MDE4OX0.clPCPTXun0-bLiPGNJEgMP4HQIQC5WOigZ2YGfyrDXI";

// Langsung inisialisasi (karena library CDN sudah terpasang di HTML)
if (typeof supabase !== 'undefined') {
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("⚡ Supabase MamangGS Connected!");
} else {
  console.error("❌ Library Supabase belum ter-load dari HTML!");
}