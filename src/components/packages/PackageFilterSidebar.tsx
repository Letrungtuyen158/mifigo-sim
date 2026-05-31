"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  DATA_GB_OPTIONS,
  DAY_OPTIONS,
  PACKAGE_TYPES,
  SORT_OPTIONS,
} from "@/lib/constants";
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
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const range = safeMax - safeMin || 1;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-slate-500">
        Kéo hai nút để chọn khoảng giá. Giá trên thẻ có thể theo cấp CTV/Đại lý.
      </p>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
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
          className="range-thumb absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          value={valueMax}
          onChange={(e) =>
            onChange(valueMin, Math.max(Number(e.target.value), valueMin))
          }
          className="range-thumb absolute inset-0 z-30 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{formatVnd(valueMin)}</span>
        <span className="font-medium text-[#1d6be8]">
          {formatVnd(valueMin)} — {formatVnd(valueMax)}
        </span>
        <span>{formatVnd(valueMax)}</span>
      </div>
    </div>
  );
}

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
  const [values, setValues] = useState(initial);
  const [priceMin, setPriceMin] = useState(
    initial.minPrice ? Number(initial.minPrice) : priceBounds.min
  );
  const [priceMax, setPriceMax] = useState(
    initial.maxPrice ? Number(initial.maxPrice) : priceBounds.max
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
    <form onSubmit={handleSubmit} className="card sticky top-24 space-y-5 p-5">
      <h2 className="text-lg font-black text-slate-900">Bộ lọc</h2>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Sắp xếp theo
        </label>
        <select
          value={values.sort}
          onChange={(e) => setValues((v) => ({ ...v, sort: e.target.value }))}
          className={selectClass}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Loại gói cước
        </label>
        <select
          value={values.packageType}
          onChange={(e) =>
            setValues((v) => ({ ...v, packageType: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">Tất cả loại</option>
          {PACKAGE_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Số ngày
        </label>
        <select
          value={values.days}
          onChange={(e) => setValues((v) => ({ ...v, days: e.target.value }))}
          className={selectClass}
        >
          <option value="">Tất cả</option>
          {DAY_OPTIONS.map((d) => (
            <option key={d} value={String(d)}>
              {d} ngày
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Dung lượng
        </label>
        <select
          value={values.dataGb}
          onChange={(e) => setValues((v) => ({ ...v, dataGb: e.target.value }))}
          className={selectClass}
        >
          <option value="">Tất cả</option>
          <option value="unlimited">Không giới hạn</option>
          {DATA_GB_OPTIONS.map((gb) => (
            <option key={gb} value={String(gb)}>
              {gb} GB
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Loại SIM
        </label>
        <select
          value={values.simType}
          onChange={(e) => setValues((v) => ({ ...v, simType: e.target.value }))}
          className={selectClass}
        >
          <option value="">eSIM & SIM vật lý</option>
          <option value="esim">eSIM</option>
          <option value="physical">SIM vật lý</option>
        </select>
      </div>

      {priceBounds.max > 0 ? (
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-800">
            Giá tiền
          </label>
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            valueMin={priceMin}
            valueMax={priceMax}
            onChange={(nextMin, nextMax) => {
              setPriceMin(nextMin);
              setPriceMax(nextMax);
            }}
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-800">
          Số lượng (đại lý)
        </label>
        <input
          type="number"
          min={1}
          value={values.quantity}
          onChange={(e) =>
            setValues((v) => ({ ...v, quantity: e.target.value }))
          }
          className={selectClass}
        />
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Áp dụng
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    </form>
  );
}
