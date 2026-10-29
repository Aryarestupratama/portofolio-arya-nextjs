import { Container } from "@/components/public/Container";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton khusus detail project: area screenshot di kiri,
// sidebar judul + chip di kanan.
export default function ProjectDetailLoading() {
  return (
    <section
      className="pb-20 pt-10 md:pb-28 md:pt-14"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Memuat project…</span>
      <Container wide>
        <Skeleton className="h-4 w-28" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Skeleton className="aspect-[16/10] w-full rounded-lg lg:col-span-8" />
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
            <Skeleton className="mt-6 h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    </section>
  );
}
