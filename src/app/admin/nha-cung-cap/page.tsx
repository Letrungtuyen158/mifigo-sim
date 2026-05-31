"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Supplier } from "@/lib/types";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    void fetch("/api/admin/store")
      .then((r) => r.json())
      .then((d) => setSuppliers(d.data.suppliers || []));
  }, []);

  async function save() {
    const res = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suppliers }),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu nhà cung cấp");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Nhà cung cấp</h1>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Lưu
        </button>
      </div>
      <div className="space-y-3">
        {suppliers.map((s, idx) => (
          <div key={s.id} className="card grid gap-3 p-4 sm:grid-cols-3">
            <input
              className="rounded border px-3 py-2 text-sm"
              value={s.name}
              onChange={(e) => {
                const next = [...suppliers];
                next[idx] = { ...s, name: e.target.value };
                setSuppliers(next);
              }}
            />
            <input
              className="rounded border px-3 py-2 text-sm"
              value={s.code}
              onChange={(e) => {
                const next = [...suppliers];
                next[idx] = { ...s, code: e.target.value };
                setSuppliers(next);
              }}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.active}
                onChange={(e) => {
                  const next = [...suppliers];
                  next[idx] = { ...s, active: e.target.checked };
                  setSuppliers(next);
                }}
              />
              Đang hoạt động
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
