import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client Supabase TANPA cookies() untuk membaca data publik.
//
// Kenapa penting: memanggil cookies() (lib/supabase/server.ts) membuat
// sebuah route otomatis menjadi dynamic, sehingga `revalidate` / ISR
// diabaikan dan setiap kunjungan harus render ulang + query ke Supabase.
// Semua halaman publik cukup membaca data dengan anon key (RLS: SELECT
// terbuka untuk anon), jadi pakai client ini supaya halaman benar-benar
// di-cache (ISR) dan dilayani instan dari CDN Vercel.
//
// JANGAN dipakai untuk admin / mutasi: itu tetap pakai createClient()
// dari server.ts supaya RLS membaca session owner.
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
