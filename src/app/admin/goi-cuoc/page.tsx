"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPackagesWithPricing,
  fetchAdminSuppliers,
} from "@/lib/admin-pricing";
import { adminPageHeaderClass, adminTableWrapClass } from "@/lib/admin-utils";
import { formatDataGb, formatSimType, formatVnd } from "@/lib/format";
import type { PackagePricingRow, Supplier } from "@/lib/types";

export default function AdminSupplierCostListPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PackagePricingRow[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [supplierRows, data] = await Promise.all([
        fetchAdminSuppliers(),
        fetchAdminPackagesWithPricing(p),
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
      toast.error(e instanceof Error ? e.message : "Lỗi tải giá nhập");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function supplierName(id: string | null) {
    if (!id) return "—";
    return suppliers.find((s) => s.id === id)?.name || id.slice(-6);
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <h1 className="text-2xl font-black">Giá vốn NCC</h1>
          <p className="text-sm text-slate-600">
            Chi tiết giá vốn: <code className="text-xs">GET /admin/packages/:id/supplier-prices</code>.
            CRUD: <code className="text-xs">/admin/supplier-package-prices</code>.
          </p>
        </div>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">NCC rẻ nhất</th>
                <th className="px-3 py-2">Giá nhập</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.packageId} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500">
                      {row.country} · {formatSimType(row.simType)} ·{" "}
                      {formatDataGb(row.dataGb)} · {row.days} ngày
                    </div>
                  </td>
                  <td className="px-3 py-2">{supplierName(row.supplierId)}</td>
                  <td className="px-3 py-2 font-semibold text-[#1d6be8]">
                    {row.costPrice != null ? formatVnd(row.costPrice) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/goi-cuoc/${row.packageId}`}
                      className="text-sm font-semibold text-[#1d6be8] hover:underline"
                    >
                      Sửa giá NCC →
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
