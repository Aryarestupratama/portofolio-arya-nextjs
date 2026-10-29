import { Container } from "@/components/public/Container";
import { Skeleton } from "@/components/ui/skeleton";

// Tampil instan saat navigasi antar halaman publik sambil menunggu
// halaman berikutnya siap (header & footer tetap terlihat).
export default function PublicLoading() {
  return (
    <section
      className="pb-24 pt-10 md:pb-32 md:pt-16"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Memuat…</span>
      <Container wide>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-6 h-12 w-3/4 max-w-xl md:h-20" />

        <div className="mt-10 flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="mt-5 h-6 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
              <Skeleton className="mt-4 h-4 w-full" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
