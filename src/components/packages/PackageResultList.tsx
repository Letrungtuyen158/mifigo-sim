"use client";

import type { PackageSearchResult } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";
import { tDataGb, tSimType } from "@/lib/i18n";
import { formatVnd } from "@/lib/format";

export default function PackageResultList({
  results,
  role,
  onAdd,
}: {
  results: PackageSearchResult[];
  role: string;
  onAdd?: (item: PackageSearchResult) => void;
}) {
  const { t, locale } = useTranslation();

  if (results.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-500">
        {t("search.noResults")}
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
              {tSimType(locale, item.package.simType)}
            </span>
            {item.isBestCost ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {t("search.bestPrice")}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 min-h-[3rem] text-sm font-bold leading-snug text-slate-900">
            {item.package.name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {tDataGb(locale, item.package.dataGb)}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {item.package.days} {t("search.perDay")}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {item.supplier.name}
            </span>
          </div>

          {role === "admin" ? (
            <p className="mt-2 text-xs text-amber-700">
              {t("search.costPrice")}: {formatVnd(item.package.costPrice)}
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
            <div className="text-[11px] text-slate-500">{t("search.unitPrice")}</div>

            {onAdd ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-primary min-h-10 flex-1 text-sm"
                  onClick={() => onAdd(item)}
                >
                  {t("common.addToCart")}
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
