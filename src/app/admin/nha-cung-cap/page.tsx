"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { inputClass } from "@/lib/admin-utils";
import type { Supplier } from "@/lib/types";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [createForm, setCreateForm] = useState({ name: "", code: "", note: "" });

  const load = useCallback(() => {
    void fetch("/api/admin/suppliers")
      .then((r) => r.json())
      .then((d) => {
        const list = (Array.isArray(d.data) ? d.data : []).map(
          (s: Record<string, unknown>) => ({
            id: String(s._id || s.id),
            name: String(s.name || ""),
            code: String(s.code || ""),
            note: s.note ? String(s.note) : undefined,
            active: s.isActive !== false,
          })
        );
        setSuppliers(list);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createSupplier(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, isActive: true }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo NCC");
    setCreateForm({ name: "", code: "", note: "" });
    load();
  }

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
          Lưu chỉnh sửa
        </button>
      </div>

      <form onSubmit={(e) => void createSupplier(e)} className="card grid gap-3 p-4 sm:grid-cols-3">
        <input className={inputClass} placeholder="Tên NCC" value={createForm.name} required onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
        <input className={inputClass} placeholder="Mã code" value={createForm.code} required onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })} />
        <button type="submit" className="btn-primary">Tạo NCC mới</button>
      </form>

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
            <input className="rounded border px-3 py-2 text-sm bg-slate-50" value={s.code} readOnly title="Mã không đổi trên BE" />
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
