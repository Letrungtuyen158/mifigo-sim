"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { inputClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminArray, normalizePaginated } from "@/lib/admin-list";
import type { Supplier } from "@/lib/types";

export default function AdminSuppliersPage() {
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState(1);
  const [createForm, setCreateForm] = useState({ name: "", code: "", note: "" });

  const list = useMemo(
    () => normalizePaginated<Supplier>(allSuppliers, page, ADMIN_LIST_LIMIT),
    [allSuppliers, page]
  );

  const loadAll = useCallback(async () => {
    const raw = await fetchAdminArray<Record<string, unknown>>("/api/admin/suppliers");
    setAllSuppliers(
      raw.map((s) => ({
        id: String(s._id || s.id),
        name: String(s.name || ""),
        code: String(s.code || ""),
        note: s.note ? String(s.note) : undefined,
        active: s.isActive !== false,
      }))
    );
  }, []);

  useEffect(() => {
    void loadAll().catch(() => toast.error("Lỗi tải NCC"));
  }, [loadAll]);

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
    await loadAll();
    setPage(1);
  }

  async function save() {
    const pageItems = list.items;
    const res = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suppliers: pageItems }),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu nhà cung cấp trên trang này");
    await loadAll();
  }

  function updateRow(idx: number, patch: Partial<Supplier>) {
    const globalIdx = (page - 1) * ADMIN_LIST_LIMIT + idx;
    setAllSuppliers((prev) => prev.map((s, i) => (i === globalIdx ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Nhà cung cấp</h1>
          <p className="text-xs text-slate-500">API BE trả về full list — phân trang hiển thị phía FE.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Lưu trang này
        </button>
      </div>

      <form onSubmit={(e) => void createSupplier(e)} className="card grid gap-3 p-4 sm:grid-cols-3">
        <input className={inputClass} placeholder="Tên NCC" value={createForm.name} required onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
        <input className={inputClass} placeholder="Mã code" value={createForm.code} required onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })} />
        <button type="submit" className="btn-primary">Tạo NCC mới</button>
      </form>

      <div className="card space-y-3 p-4">
        {list.items.map((s, idx) => (
          <div key={s.id} className="grid gap-3 border-b border-slate-100 pb-3 last:border-0 sm:grid-cols-3">
            <input
              className="rounded border px-3 py-2 text-sm"
              value={s.name}
              onChange={(e) => updateRow(idx, { name: e.target.value })}
            />
            <input className="rounded border bg-slate-50 px-3 py-2 text-sm" value={s.code} readOnly />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.active}
                onChange={(e) => updateRow(idx, { active: e.target.checked })}
              />
              Đang hoạt động
            </label>
          </div>
        ))}
        <AdminPagination
          page={list.page}
          limit={list.limit}
          total={list.total}
          totalPages={list.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
