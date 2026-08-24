import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Dipakai KHUSUS untuk konteks yang jalan tanpa HTTP request, seperti
// generateStaticParams() — di situ Next.js melarang pemakaian cookies()
// (lib/supabase/server.ts) karena memang belum ada request/session sama
// sekali saat build time. Client ini pakai anon key polos tanpa cookie
// handling, cukup untuk baca data publik (RLS anon SELECT tetap berlaku
// normal, sama seperti browser client).
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}