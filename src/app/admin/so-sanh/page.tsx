"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPackagesWithPricing,
  fetchAdminSuppliers,
} from "@/lib/admin-pricing";
import { adminTableWrapClass } from "@/lib/admin-utils";
import { formatDataGb, formatSimType, formatVnd } from "@/lib/format";
import type { PackagePricingRow, Supplier } from "@/lib/types";

export default function AdminCompareListPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PackagePricingRow[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [supplierRows, data] = await Promise.all([
        fetchAdminSuppliers(),
        fetchAdminPackagesWithPricing(p, ADMIN_LIST_LIMIT, {
          channel: "anonymous",
          quantity: 1,
        }),
      ]);
      setSuppliers(supplierRows);
      setRows(data.items);
      setMeta({
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
        page: data.page,
      });
      setPage(data.page);
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
    () => [...new Set(rows.map((r) => r.country).filter(Boolean))],
    [rows]
  );

  const filtered = country ? rows.filter((r) => r.country === country) : rows;

  function supplierName(id: string | null) {
    if (!id) return "—";
    return suppliers.find((s) => s.id === id)?.name || "NCC";
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">So sánh giá nhập NCC</h1>
        <p className="text-sm text-slate-600">
          So sánh giá vốn rẻ nhất, giá bán và lợi nhuận theo gói. Xem chi tiết từng nhà cung cấp ở trang con.
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

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">NCC rẻ nhất</th>
                <th className="px-3 py-2">Giá nhập</th>
                <th className="px-3 py-2">Giá bán</th>
                <th className="px-3 py-2">Lợi nhuận</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.packageId} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500">
                      {formatSimType(row.simType)} · {formatDataGb(row.dataGb)} · {row.days} ngày
                    </div>
                  </td>
                  <td className="px-3 py-2">{supplierName(row.supplierId)}</td>
                  <td className="px-3 py-2">
                    {row.costPrice != null ? formatVnd(row.costPrice) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.salePrice != null ? formatVnd(row.salePrice) : "—"}
                  </td>
                  <td
                    className={`px-3 py-2 font-semibold ${
                      (row.profit ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {row.profit != null ? formatVnd(row.profit) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/so-sanh/${row.packageId}`}
                      className="text-sm font-semibold text-[#1d6be8] hover:underline"
                    >
                      So sánh NCC →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AdminPagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
