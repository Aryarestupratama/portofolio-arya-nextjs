import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belum login (mis. halaman /admin/login): render polos tanpa sidebar.
  if (!user) {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  return <AdminShell>{children}</AdminShell>;
}
