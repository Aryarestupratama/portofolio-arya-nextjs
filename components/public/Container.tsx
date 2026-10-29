import { cn } from "@/lib/utils";

// `wide` dipakai halaman/section hasil redesign (Design.md v2 §4):
// max-w-[1440px] + padding lebih longgar. Default tetap max-w-5xl agar
// halaman yang belum dimigrasi tidak berubah lebarnya.
export function Container({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto px-6 md:px-10",
        wide ? "max-w-[1440px]" : "max-w-5xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
