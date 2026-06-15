export default function AdminPageLoading({ label = "Đang tải…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200/80 bg-white p-8 text-slate-500"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#1d6be8]"
        aria-hidden
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
