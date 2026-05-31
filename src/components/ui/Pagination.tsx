"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  basePath = "/tra-cuu",
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pageItems = getPageItems(page, totalPages);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    router.push(`${basePath}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-600">
        {t("pagination.showing", { from, to, total })}
      </p>

      <nav className="flex flex-wrap items-center justify-center gap-1" aria-label={t("pagination.aria")}>
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("pagination.prev")}
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-sm text-slate-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={item === page ? "page" : undefined}
              className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                item === page
                  ? "bg-[#1d6be8] text-white shadow-sm"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("pagination.next")}
        </button>
      </nav>
    </div>
  );
}
