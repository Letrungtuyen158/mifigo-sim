"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { DATA_GB_OPTIONS, DAY_OPTIONS } from "@/lib/constants";
import { tSortOption } from "@/lib/i18n";
import { formatVnd } from "@/lib/format";

export interface SidebarFilterValues {
  sort: string;
  packageType: string;
  dataGb: string;
  days: string;
  simType: string;
  quantity: string;
  minPrice: string;
  maxPrice: string;
}

function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  hint,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  hint: string;
  onChange: (min: number, max: number) => void;
}) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const range = safeMax - safeMin || 1;

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-xs leading-relaxed text-slate-500">{hint}</p>
      {/* px-2.5 = half thumb width — keeps 18px handles inside the card */}
      <div className="px-2.5">
        <div className="relative h-8">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#1d6be8]/40"
            style={{
              left: `${((valueMin - safeMin) / range) * 100}%`,
              right: `${100 - ((valueMax - safeMin) / range) * 100}%`,
            }}
          />
          <input
            type="range"
            min={safeMin}
            max={safeMax}
            value={valueMin}
            onChange={(e) =>
              onChange(Math.min(Number(e.target.value), valueMax), valueMax)
            }
            className="range-thumb pointer-events-none absolute inset-0 z-20 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            min={safeMin}
            max={safeMax}
            value={valueMax}
            onChange={(e) =>
              onChange(valueMin, Math.max(Number(e.target.value), valueMin))
            }
            className="range-thumb pointer-events-none absolute inset-0 z-30 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          />
        </div>
      </div>
      <p className="text-center text-xs font-medium text-[#1d6be8]">
        {formatVnd(valueMin)} — {formatVnd(valueMax)}
      </p>
      <div className="flex justify-between gap-2 text-[11px] font-bold text-slate-600">
        <span className="shrink-0">{formatVnd(safeMin)}</span>
        <span className="shrink-0">{formatVnd(safeMax)}</span>
      </div>
    </div>
  );
}

const SORT_VALUES = [
  "price_asc",
  "price_desc",
  "days_asc",
  "days_desc",
  "data_asc",
  "data_desc",
] as const;

const PACKAGE_TYPE_VALUES = ["daily", "total", "unlimited"] as const;

export default function PackageFilterSidebar({
  initial,
  priceBounds,
  onApply,
  onReset,
}: {
  initial: SidebarFilterValues;
  priceBounds: { min: number; max: number };
  onApply: (values: SidebarFilterValues) => void;
  onReset: () => void;
}) {
  const { t, locale } = useTranslation();
  const [values, setValues] = useState(initial);
  const [priceMin, setPriceMin] = useState(
    initial.minPrice ? Number(initial.minPrice) : priceBounds.min
  );
  const [priceMax, setPriceMax] = useState(
    initial.maxPrice ? Number(initial.maxPrice) : priceBounds.max
  );

  const sortOptions = useMemo(
    () => SORT_VALUES.map((v) => ({ value: v, label: tSortOption(locale, v) })),
    [locale]
  );

  useEffect(() => {
    setValues(initial);
    setPriceMin(initial.minPrice ? Number(initial.minPrice) : priceBounds.min);
    setPriceMax(initial.maxPrice ? Number(initial.maxPrice) : priceBounds.max);
  }, [initial, priceBounds.min, priceBounds.max]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onApply({
      ...values,
      minPrice: priceBounds.max > 0 ? String(priceMin) : "",
      maxPrice: priceBounds.max > 0 ? String(priceMax) : "",
    });
  }

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="card sticky top-24 min-w-0 space-y-5 overflow-hidden p-5"
    >
      <h2 className="text-lg font-black text-slate-900">{t("search.filters")}</h2>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          {t("search.sortBy")}
        </label>
        <select
          value={values.sort}
          onChange={(e) => setValues((v) => ({ ...v, sort: e.target.value }))}
          className={selectClass}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          {t("search.packageType")}
        </label>
        <select
          value={values.packageType}
          onChange={(e) =>
            setValues((v) => ({ ...v, packageType: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">{t("common.allTypes")}</option>
          {PACKAGE_TYPE_VALUES.map((p) => (
            <option key={p} value={p}>
              {t(`packageType.${p}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          {t("search.daysLabel")}
        </label>
        <select
          value={values.days}
          onChange={(e) => setValues((v) => ({ ...v, days: e.target.value }))}
          className={selectClass}
        >
          <option value="">{t("common.all")}</option>
          {DAY_OPTIONS.map((d) => (
            <option key={d} value={String(d)}>
              {d} {t("common.days")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          {t("search.dataLabel")}
        </label>
        <select
          value={values.dataGb}
          onChange={(e) => setValues((v) => ({ ...v, dataGb: e.target.value }))}
          className={selectClass}
        >
          <option value="">{t("common.all")}</option>
          <option value="unlimited">{t("search.unlimited")}</option>
          {DATA_GB_OPTIONS.map((gb) => (
            <option key={gb} value={String(gb)}>
              {gb} GB
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          {t("search.simType")}
        </label>
        <select
          value={values.simType}
          onChange={(e) => setValues((v) => ({ ...v, simType: e.target.value }))}
          className={selectClass}
        >
          <option value="">{t("search.simAll")}</option>
          <option value="esim">{t("simType.esim")}</option>
          <option value="physical">{t("simType.physical")}</option>
        </select>
      </div>

      {priceBounds.max > 0 ? (
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-800">
            {t("search.priceLabel")}
          </label>
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            valueMin={priceMin}
            valueMax={priceMax}
            hint={t("search.priceHint")}
            onChange={(nextMin, nextMax) => {
              setPriceMin(nextMin);
              setPriceMax(nextMax);
            }}
          />
        </div>
      ) : null}

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          {t("common.apply")}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          {t("common.reset")}
        </button>
      </div>
    </form>
  );
}
