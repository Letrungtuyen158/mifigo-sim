"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPackageDetail,
  fetchAdminSuppliers,
  fetchSupplierPriceRowsForPackage,
  saveSupplierPriceRows,
} from "@/lib/admin-pricing";
import { adminPageHeaderClass, adminTableWrapClass } from "@/lib/admin-utils";
import { formatVnd } from "@/lib/format";
import type { Supplier, SupplierPackage } from "@/lib/types";

export default function AdminSupplierCostDetailPage() {
  const params = useParams<{ packageId: string }>();
  const packageId = params.packageId;
  const [page, setPage] = useState(1);
  const [packageName, setPackageName] = useState("");
  const [rows, setRows] = useState<SupplierPackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const [supplierRows, pkg, pricePage] = await Promise.all([
          fetchAdminSuppliers(),
          fetchAdminPackageDetail(packageId),
          fetchSupplierPriceRowsForPackage(packageId, p),
        ]);
        setSuppliers(supplierRows);
        setPackageName(pkg.name);
        setRows(pricePage.items);
        setMeta({
          total: pricePage.total,
          totalPages: pricePage.totalPages,
          limit: pricePage.limit,
          page: pricePage.page,
        });
        setPage(pricePage.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải giá nhập");
      } finally {
        setLoading(false);
      }
    },
    [packageId]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function updateCost(id: string, costPrice: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, costPrice } : r)));
  }

  async function save() {
    setSaving(true);
    try {
      await saveSupplierPriceRows(rows);
      toast.success("Đã lưu giá nhập");
      void load(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <Link href="/admin/goi-cuoc" className="text-sm font-semibold text-[#1d6be8] hover:underline">
            ← Danh sách giá nhập
          </Link>
          <h1 className="mt-2 text-2xl font-black">{packageName || "Giá nhập NCC"}</h1>
          <p className="text-sm text-slate-600">
            <code className="text-xs">GET /admin/packages/:id/supplier-prices</code>
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={loading || saving}
          onClick={() => void save()}
        >
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có giá nhập NCC cho gói này.</p>
        ) : (
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">NCC</th>
                <th className="px-3 py-2">Giá nhập</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">
                    {suppliers.find((s) => s.id === row.supplierId)?.name || row.supplierId}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-32 rounded border px-2 py-1"
                      value={row.costPrice}
                      onChange={(e) => updateCost(row.id, Number(e.target.value))}
                    />
                    <span className="ml-2 text-xs text-slate-500">
                      {formatVnd(row.costPrice)}
                    </span>
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
