import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <AdminSidebar />
      
      {/* Area utama (Main) yang bisa di-scroll secara independen */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}