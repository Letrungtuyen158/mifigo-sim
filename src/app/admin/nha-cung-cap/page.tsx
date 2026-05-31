"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminWriteGate from "@/components/admin/AdminWriteGate";
import StaffReadOnlyBanner from "@/components/admin/StaffReadOnlyBanner";
import AdminPagination from "@/components/admin/AdminPagination";
import { useCanAdminWrite } from "@/contexts/AdminRoleContext";
import { inputClass, adminPageHeaderClass, mongoIdString } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";
import type { Supplier } from "@/lib/types";

function mapSupplierRow(s: Record<string, unknown>): Supplier {
  return {
    id: mongoIdString(s._id) || mongoIdString(s.id),
    name: String(s.name || ""),
    code: String(s.code || ""),
    note: s.note ? String(s.note) : undefined,
    active: s.isActive !== false,
  };
}

export default function AdminSuppliersPage() {
  const canWrite = useCanAdminWrite();
  const [list, setList] = useState<AdminPaginated<Supplier>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState<Record<string, Partial<Supplier>>>({});
  const [createForm, setCreateForm] = useState({ name: "", code: "", note: "" });

  const rows = useMemo(
    () => list.items.map((s) => ({ ...s, ...edits[s.id] })),
    [list.items, edits]
  );

  const load = useCallback(async (p = page) => {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/suppliers",
        p
      );
      setList({
        ...data,
        items: data.items.map(mapSupplierRow),
      });
      setPage(data.page);
      setEdits({});
    } catch {
      toast.error("Lỗi tải NCC");
    }
  }, [page]);

  useEffect(() => {
    void load(page);
  }, [page]);

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
    setPage(1);
    void load(1);
  }

  async function save() {
    const res = await Promise.all(
      rows.map((s) =>
        fetch(`/api/admin/suppliers/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: s.name,
            isActive: s.active,
            note: s.note,
          }),
        })
      )
    );
    if (res.some((r) => !r.ok)) return toast.error("Lưu thất bại");
    toast.success("Đã lưu nhà cung cấp trên trang này");
    void load(page);
  }

  function updateRow(id: string, patch: Partial<Supplier>) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  return (
    <div className="space-y-4">
      <div className={`${adminPageHeaderClass}`}>
        <h1 className="text-2xl font-black">Nhà cung cấp</h1>
        {canWrite ? (
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => void save()}>
            Lưu trang này
          </button>
        ) : null}
      </div>

      <StaffReadOnlyBanner />

      <AdminWriteGate>
      <form onSubmit={(e) => void createSupplier(e)} className="card grid gap-3 p-4 sm:grid-cols-3">
        <input className={inputClass} placeholder="Tên NCC" value={createForm.name} required onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
        <input className={inputClass} placeholder="Mã code" value={createForm.code} required onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })} />
        <button type="submit" className="btn-primary">Tạo NCC mới</button>
      </form>
      </AdminWriteGate>

      <div className="card space-y-3 p-4">
        {rows.map((s) => (
          <div key={s.id} className="grid gap-3 border-b border-slate-100 pb-3 last:border-0 sm:grid-cols-3">
            {canWrite ? (
              <input
                className={`${inputClass} min-w-0`}
                value={s.name}
                onChange={(e) => updateRow(s.id, { name: e.target.value })}
              />
            ) : (
              <div className="text-sm font-semibold">{s.name}</div>
            )}
            <input className="rounded border bg-slate-50 px-3 py-2 text-sm" value={s.code} readOnly />
            {canWrite ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={s.active}
                  onChange={(e) => updateRow(s.id, { active: e.target.checked })}
                />
                Đang hoạt động
              </label>
            ) : (
              <div className="text-sm text-slate-600">{s.active ? "Đang hoạt động" : "Tắt"}</div>
            )}
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
