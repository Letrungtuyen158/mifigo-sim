"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminSuppliers, fetchSupplierPriceRows, saveSupplierPriceRows } from "@/lib/admin-pricing";
import { adminPageHeaderClass, adminTableWrapClass } from "@/lib/admin-utils";
import { formatVnd } from "@/lib/format";
import type { Supplier, SupplierPackage } from "@/lib/types";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [supplierRows, priceRows] = await Promise.all([
        fetchAdminSuppliers(),
        fetchSupplierPriceRows(),
      ]);
      setSuppliers(supplierRows);
      setPackages(priceRows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải giá nhập");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateCost(id: string, costPrice: number) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, costPrice } : p))
    );
  }

  async function save() {
    try {
      await saveSupplierPriceRows(packages);
      toast.success("Đã lưu giá nhập gói cước");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    }
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <h1 className="text-2xl font-black">Gói cước & giá nhập</h1>
          <p className="text-sm text-slate-600">
            Admin nhập đơn giá từng nhà cung cấp (API supplier-package-prices).
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={loading}
          onClick={() => void save()}
        >
          Lưu
        </button>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">NCC</th>
                <th className="px-3 py-2">Giá nhập</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t">
                  <td className="px-3 py-2">{pkg.name}</td>
                  <td className="px-3 py-2">
                    {suppliers.find((s) => s.id === pkg.supplierId)?.name}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-32 rounded border px-2 py-1"
                      value={pkg.costPrice}
                      onChange={(e) => updateCost(pkg.id, Number(e.target.value))}
                    />
                    <span className="ml-2 text-xs text-slate-500">
                      hiện: {formatVnd(pkg.costPrice)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
