"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { COUNTRIES, DATA_GB_OPTIONS, DAY_OPTIONS, PACKAGE_TYPES } from "@/lib/constants";

export interface PackageSearchValues {
  country: string;
  packageType: string;
  dataGb: string;
  days: string;
  simType: string;
  quantity: string;
}

const defaultValues: PackageSearchValues = {
  country: "",
  packageType: "",
  dataGb: "",
  days: "",
  simType: "",
  quantity: "1",
};

export default function PackageSearchForm({
  initial,
  compact = false,
}: {
  initial?: Partial<PackageSearchValues>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PackageSearchValues>({
    ...defaultValues,
    ...initial,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (values.country) params.set("country", values.country);
    if (values.packageType) params.set("packageType", values.packageType);
    if (values.dataGb) params.set("dataGb", values.dataGb);
    if (values.days) params.set("days", values.days);
    if (values.simType) params.set("simType", values.simType);
    if (values.quantity) params.set("quantity", values.quantity);
    router.push(`/tra-cuu?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`card ${compact ? "p-4" : "p-5 lg:p-6"} space-y-4`}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Quốc gia
          </label>
          <select
            value={values.country}
            onChange={(e) => setValues((v) => ({ ...v, country: e.target.value }))}
            className="input-field"
          >
            <option value="">Tất cả quốc gia</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Loại gói cước
          </label>
          <select
            value={values.packageType}
            onChange={(e) =>
              setValues((v) => ({ ...v, packageType: e.target.value }))
            }
            className="input-field"
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
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Dung lượng (GB)
          </label>
          <select
            value={values.dataGb}
            onChange={(e) => setValues((v) => ({ ...v, dataGb: e.target.value }))}
            className="input-field"
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
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Số ngày
          </label>
          <select
            value={values.days}
            onChange={(e) => setValues((v) => ({ ...v, days: e.target.value }))}
            className="input-field"
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
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Loại SIM
          </label>
          <select
            value={values.simType}
            onChange={(e) => setValues((v) => ({ ...v, simType: e.target.value }))}
            className="input-field"
          >
            <option value="">eSIM & SIM vật lý</option>
            <option value="esim">eSIM</option>
            <option value="physical">SIM vật lý</option>
          </select>
        </div>
      </div>

      {!compact && (
        <div className="max-w-xs">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Số lượng (đại lý xem bậc giá)
          </label>
          <input
            type="number"
            min={1}
            value={values.quantity}
            onChange={(e) =>
              setValues((v) => ({ ...v, quantity: e.target.value }))
            }
            className="input-field"
          />
        </div>
      )}

      <button type="submit" className="btn-primary w-full md:w-auto">
        Tra cứu gói cước
      </button>
    </form>
  );
}
