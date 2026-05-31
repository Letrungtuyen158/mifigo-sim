"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDataGb, formatSimType, formatVnd } from "@/lib/format";
import type { SupplierPackage } from "@/lib/types";

export default function AdminComparePage() {
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [country, setCountry] = useState("");

  useEffect(() => {
    void fetch("/api/admin/store")
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.data.packages || []);
        setSuppliers(d.data.suppliers || []);
      });
  }, []);

  const countries = useMemo(
    () => [...new Set(packages.map((p) => p.country))],
    [packages]
  );

  const grouped = useMemo(() => {
    const filtered = country
      ? packages.filter((p) => p.country === country)
      : packages;
    const map = new Map<string, SupplierPackage[]>();
    for (const pkg of filtered) {
      const key = [
        pkg.country,
        pkg.simType,
        pkg.packageType,
        pkg.dataGb ?? "unl",
        pkg.days,
      ].join("|");
      const list = map.get(key) ?? [];
      list.push(pkg);
      map.set(key, list);
    }
    return [...map.entries()].map(([key, list]) => ({
      key,
      list: [...list].sort((a, b) => a.costPrice - b.costPrice),
      best: [...list].sort((a, b) => a.costPrice - b.costPrice)[0],
    }));
  }, [packages, country]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">So sánh giá nhập NCC</h1>
        <p className="text-sm text-slate-600">
          Chọn gói rẻ nhất theo từng nhóm quốc gia/GB/loại SIM để bán cạnh tranh.
        </p>
      </div>

      <select
        className="rounded-xl border px-3 py-2 text-sm"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">Tất cả quốc gia</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="space-y-4">
        {grouped.map(({ key, list, best }) => (
          <div key={key} className="card p-4">
            <div className="font-bold">
              {best.country} · {formatSimType(best.simType)} · {formatDataGb(best.dataGb)} ·{" "}
              {best.days} ngày
            </div>
            <div className="mt-2 text-sm text-emerald-700">
              Rẻ nhất: {suppliers.find((s) => s.id === best.supplierId)?.name} —{" "}
              {formatVnd(best.costPrice)}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {list.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-xl border p-3 text-sm ${
                    pkg.id === best.id ? "border-emerald-300 bg-emerald-50" : ""
                  }`}
                >
                  <div className="font-semibold">
                    {suppliers.find((s) => s.id === pkg.supplierId)?.name}
                  </div>
                  <div>{pkg.name}</div>
                  <div className="font-bold text-[#1d6be8]">
                    {formatVnd(pkg.costPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
