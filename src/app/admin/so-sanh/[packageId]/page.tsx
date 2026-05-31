"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminPackageDetail, fetchBestSupplierComparison } from "@/lib/admin-pricing";
import { adminTableWrapClass } from "@/lib/admin-utils";
import { formatVnd } from "@/lib/format";

interface SupplierCompareRow {
  supplierName?: string;
  supplierCode?: string;
  costPrice?: number;
  salePrice?: number;
  profit?: number;
  profitRate?: number;
  availableQuantity?: number;
  stockCount?: number;
}

export default function AdminCompareDetailPage() {
  const params = useParams<{ packageId: string }>();
  const packageId = params.packageId;
  const [packageName, setPackageName] = useState("");
  const [best, setBest] = useState<SupplierCompareRow | null>(null);
  const [allSuppliers, setAllSuppliers] = useState<SupplierCompareRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pkg, data] = await Promise.all([
        fetchAdminPackageDetail(packageId, "anonymous", 1),
        fetchBestSupplierComparison(packageId),
      ]);
      setPackageName(pkg.name);
      setBest((data.bestSupplier as SupplierCompareRow) || null);
      setAllSuppliers((data.allSuppliers as SupplierCompareRow[]) || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải so sánh NCC");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Đang tải…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/so-sanh" className="text-sm font-semibold text-[#1d6be8] hover:underline">
          ← Danh sách so sánh
        </Link>
        <h1 className="mt-2 text-2xl font-black">{packageName}</h1>
        <p className="text-sm text-slate-600">So sánh giá nhập giữa các nhà cung cấp cho gói này.</p>
      </div>

      {best ? (
        <div className="card bg-emerald-50 p-4 text-sm">
          <strong className="text-emerald-900">NCC rẻ nhất:</strong>{" "}
          {best.supplierName} ({best.supplierCode}) — nhập {formatVnd(Number(best.costPrice || 0))} —
          bán {formatVnd(Number(best.salePrice || 0))} — lãi{" "}
          {formatVnd(Number(best.profit || 0))} ({best.profitRate ?? 0}%)
        </div>
      ) : null}

      <div className={`card ${adminTableWrapClass} p-4`}>
        {allSuppliers.length === 0 ? (
          <p className="text-sm text-slate-500">Không có giá NCC cho gói này.</p>
        ) : (
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">NCC</th>
                <th className="px-3 py-2">Giá nhập</th>
                <th className="px-3 py-2">Giá bán</th>
                <th className="px-3 py-2">Lợi nhuận</th>
                <th className="px-3 py-2">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {allSuppliers.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t ${i === 0 ? "bg-emerald-50/60" : ""}`}
                >
                  <td className="px-3 py-2 font-medium">
                    {row.supplierName}
                    <span className="ml-1 text-xs text-slate-500">{row.supplierCode}</span>
                  </td>
                  <td className="px-3 py-2">{formatVnd(Number(row.costPrice || 0))}</td>
                  <td className="px-3 py-2">{formatVnd(Number(row.salePrice || 0))}</td>
                  <td
                    className={`px-3 py-2 font-semibold ${
                      (row.profit ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {formatVnd(Number(row.profit || 0))}
                    <span className="ml-1 text-xs font-normal text-slate-500">
                      ({row.profitRate ?? 0}%)
                    </span>
                  </td>
                  <td className="px-3 py-2">{row.stockCount ?? row.availableQuantity ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
