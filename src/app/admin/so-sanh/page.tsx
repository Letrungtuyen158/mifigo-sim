"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminSuppliers,
  fetchSupplierPriceRows,
} from "@/lib/admin-pricing";
import { formatDataGb, formatSimType, formatVnd } from "@/lib/format";
import type { Supplier, SupplierPackage } from "@/lib/types";

export default function AdminComparePage() {
  const [page, setPage] = useState(1);
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [country, setCountry] = useState("");
  const [apiBest, setApiBest] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [supplierRows, pricePage] = await Promise.all([
        fetchAdminSuppliers(),
        fetchSupplierPriceRows(p),
      ]);
      setSuppliers(supplierRows);
      setPackages(pricePage.items);
      setMeta({
        total: pricePage.total,
        totalPages: pricePage.totalPages,
        limit: pricePage.limit,
        page: pricePage.page,
      });
      setPage(pricePage.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải dữ liệu so sánh");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

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

  async function fetchBestSupplier(packageMongoId: string) {
    const res = await fetch(
      `/api/admin/packages/${packageMongoId}/best-supplier?quantity=1&channel=anonymous`
    );
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Lỗi API best-supplier");
    setApiBest(data.data as Record<string, unknown>);
    toast.success("Đã gọi API best-supplier");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">So sánh giá nhập NCC</h1>
        <p className="text-sm text-slate-600">
          Chọn gói rẻ nhất theo từng nhóm quốc gia/GB/loại SIM để bán cạnh tranh.
        </p>
      </div>

      <select
        className="w-full max-w-md rounded-xl border px-3 py-2 text-sm sm:w-auto"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        disabled={loading}
      >
        <option value="">Tất cả quốc gia</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải…</p>
      ) : null}

      {apiBest?.bestSupplier ? (
        <div className="card bg-blue-50 p-4 text-sm admin-break-text">
          <strong>API best-supplier:</strong>{" "}
          {String((apiBest.bestSupplier as Record<string, unknown>).supplierName)} — cost{" "}
          {formatVnd(Number((apiBest.bestSupplier as Record<string, unknown>).costPrice))} — sale{" "}
          {formatVnd(Number((apiBest.bestSupplier as Record<string, unknown>).salePrice))}
        </div>
      ) : null}

      <div className="space-y-4">
        {grouped.map(({ key, list, best }) => (
          <div key={key} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold">
                {best.country} · {formatSimType(best.simType)} · {formatDataGb(best.dataGb)} ·{" "}
                {best.days} ngày
              </div>
              {best.packageMongoId ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#1d6be8]"
                  onClick={() => void fetchBestSupplier(best.packageMongoId!)}
                >
                  Gọi API best-supplier
                </button>
              ) : null}
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

      <AdminPagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
