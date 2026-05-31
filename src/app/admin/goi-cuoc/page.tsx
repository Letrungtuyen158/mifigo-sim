"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatVnd } from "@/lib/format";
import type { Supplier, SupplierPackage } from "@/lib/types";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    void fetch("/api/admin/store")
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.data.packages || []);
        setSuppliers(d.data.suppliers || []);
      });
  }, []);

  function updateCost(id: string, costPrice: number) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, costPrice } : p))
    );
  }

  async function save() {
    const res = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packages }),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu giá nhập gói cước");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Gói cước & giá nhập</h1>
          <p className="text-sm text-slate-600">Admin nhập đơn giá từng nhà cung cấp.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Lưu
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
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
      </div>
    </div>
  );
}
