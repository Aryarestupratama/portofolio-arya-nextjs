import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToaster } from "@/components/admin/admin-toaster";

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
  // Toaster tetap dipasang agar notifikasi (mis. gagal login) bisa tampil.
  if (!user) {
    return (
      <div className="min-h-screen bg-paper">
        {children}
        <AdminToaster />
      </div>
    );
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <AdminToaster />
    </>
  );
}
