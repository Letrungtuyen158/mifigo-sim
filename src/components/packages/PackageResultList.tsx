"use client";

import { useEffect, useState } from "react";
import type { PackageSearchResult } from "@/lib/types";
import { useTranslation } from "@/contexts/LanguageContext";
import { tDataGb, tSimType } from "@/lib/i18n";
import { formatVnd } from "@/lib/format";
import QuantityStepper from "@/components/ui/QuantityStepper";

function parseDefaultQty(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(99, Math.max(1, Math.floor(value)));
}

export default function PackageResultList({
  results,
  role,
  defaultQuantity = 1,
  onAdd,
}: {
  results: PackageSearchResult[];
  role: string;
  defaultQuantity?: number;
  onAdd?: (item: PackageSearchResult, quantity: number) => void;
}) {
  const { t, locale } = useTranslation();
  const baseQty = parseDefaultQty(defaultQuantity);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    setQuantities((prev) => {
      const next: Record<string, number> = {};
      for (const item of results) {
        next[item.package.id] = prev[item.package.id] ?? baseQty;
      }
      return next;
    });
  }, [results, baseQty]);

  if (results.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-500">
        {t("search.noResults")}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => {
        const qty = quantities[item.package.id] ?? baseQty;
        const lineTotal = item.unitPrice * qty;

        return (
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
              {qty > 1 ? (
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {t("search.lineTotal")}: {formatVnd(lineTotal)}
                </div>
              ) : null}

              {onAdd ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      {t("search.quantity")}
                    </span>
                    <QuantityStepper
                      compact
                      value={qty}
                      ariaLabel={t("search.quantity")}
                      onChange={(next) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.package.id]: next,
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary min-h-10 w-full text-sm"
                    onClick={() => onAdd(item, qty)}
                  >
                    {t("common.addToCart")}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
