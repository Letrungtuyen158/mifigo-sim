"use client";

import type { PackageSearchResult } from "@/lib/types";
import {
  formatDataGb,
  formatSimType,
  formatVnd,
} from "@/lib/format";

export default function PackageResultList({
  results,
  role,
  onAdd,
}: {
  results: PackageSearchResult[];
  role: string;
  onAdd?: (item: PackageSearchResult) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Không tìm thấy gói cước phù hợp. Thử đổi bộ lọc.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => (
        <article
          key={item.package.id}
          className="card flex flex-col p-4 transition hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1d6be8]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              {formatSimType(item.package.simType)}
            </span>
            {item.isBestCost ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Giá tốt
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 min-h-[3rem] text-sm font-bold leading-snug text-slate-900">
            {item.package.name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {formatDataGb(item.package.dataGb)}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {item.package.days} ngày
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {item.supplier.name}
            </span>
          </div>

          {role === "admin" ? (
            <p className="mt-2 text-xs text-amber-700">
              Giá nhập: {formatVnd(item.package.costPrice)}
            </p>
          ) : null}

          {role === "agent" && item.priceTiers ? (
            <div className="mt-2 rounded-lg bg-blue-50 p-2 text-[10px] text-blue-900">
              {item.priceTiers.map((tier) => (
                <span key={tier.qty} className="mr-2 inline-block">
                  ≥{tier.qty}: {formatVnd(tier.price)}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto pt-4">
            <div className="text-xl font-black text-[#1d6be8]">
              {formatVnd(item.unitPrice)}
            </div>
            <div className="text-[11px] text-slate-500">Đơn giá / SIM</div>

            {onAdd ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-primary min-h-10 flex-1 text-sm"
                  onClick={() => onAdd(item)}
                >
                  Mua ngay
                </button>
                <button
                  type="button"
                  aria-label="Thêm vào giỏ"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#1d6be8] hover:text-[#1d6be8]"
                  onClick={() => onAdd(item)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
