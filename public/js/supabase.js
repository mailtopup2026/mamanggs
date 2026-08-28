// ===================================================
// MAMANGGS - SUPABASE CLIENT INITIALIZATION
// ===================================================
const SUPABASE_URL = "https://zggxbkjokgzauclbbbaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ3hia2pva2d6YXVjbGJiYmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTQxODksImV4cCI6MjEwMzQ5MDE4OX0.clPCPTXun0-bLiPGNJEgMP4HQIQC5WOigZ2YGfyrDXI";

// Load library Supabase dari CDN
(function loadSupabase() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = () => {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase MamangGS Connected ⚡");
  };
  document.head.appendChild(script);
})();