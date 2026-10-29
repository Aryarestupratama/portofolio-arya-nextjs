import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 pt-16">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}