const SUPABASE_URL = "https://dfsppwmuzwgkixmbqmvi.supabase.co";

const SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_KEY";

const lunaSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
