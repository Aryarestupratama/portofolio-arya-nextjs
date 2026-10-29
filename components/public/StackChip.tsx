import { cn } from "@/lib/utils";

export function StackChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-md bg-brand-wash px-2 py-1 font-mono text-[11px] leading-none text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
