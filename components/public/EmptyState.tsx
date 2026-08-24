export function EmptyState({
  icon,
  message,
}: {
  icon?: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-white px-6 py-16 text-center">
      {icon && <div className="text-ink-soft">{icon}</div>}
      <p className="text-sm text-ink-soft">{message}</p>
    </div>
  );
}
