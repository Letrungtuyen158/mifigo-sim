"use client";

const MAX_QTY = 99;

function clampQty(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_QTY, Math.max(1, Math.floor(n)));
}

export default function QuantityStepper({
  value,
  onChange,
  compact = false,
  ariaLabel,
}: {
  value: number;
  onChange: (qty: number) => void;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const qty = clampQty(value);

  function setNext(next: number) {
    onChange(clampQty(next));
  }

  const btnClass = compact
    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40";

  const inputClass = compact
    ? "h-9 w-12 rounded-lg border border-slate-200 text-center text-sm font-bold text-slate-900 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
    : "h-10 w-14 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-900 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20";

  return (
    <div
      className={`inline-flex items-center gap-1 ${compact ? "" : "gap-2"}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={btnClass}
        disabled={qty <= 1}
        aria-label="−"
        onClick={() => setNext(qty - 1)}
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={MAX_QTY}
        value={qty}
        onChange={(e) => setNext(Number(e.target.value))}
        className={inputClass}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className={btnClass}
        disabled={qty >= MAX_QTY}
        aria-label="+"
        onClick={() => setNext(qty + 1)}
      >
        +
      </button>
    </div>
  );
}
