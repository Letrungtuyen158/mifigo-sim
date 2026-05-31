"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";

const TYPES = ["retail", "agent", "collaborator", "vip"] as const;

export default function AdminCustomerGroupsPage() {
  const [list, setList] = useState<AdminPaginated<Record<string, unknown>>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", code: "", type: "retail", description: "" });

  const load = useCallback(async (p = page) => {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/customer-groups",
        p
      );
      setList(data);
      setPage(data.page);
    } catch {
      toast.error("Lỗi tải nhóm khách");
    }
  }, [page]);

  useEffect(() => {
    void load(page);
  }, [page]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/customer-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isActive: true }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo nhóm");
    setForm({ name: "", code: "", type: "retail", description: "" });
    setPage(1);
    void load(1);
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/customer-groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return toast.error("Cập nhật thất bại");
    toast.success("Đã lưu");
    void load(page);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Nhóm khách hàng</h1>
      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <input className={inputClass} placeholder="Tên nhóm" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Mã code" value={form.code} required onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input className={inputClass} placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn-primary sm:col-span-2">Tạo nhóm</button>
      </form>
      <div className="card space-y-2 p-4">
        {list.items.map((g) => {
          const id = docId(g);
          return (
            <div key={id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-2 last:border-0">
              <span className="font-bold">{String(g.name)}</span>
              <span className="text-sm text-slate-500">{String(g.code)} · {String(g.type)}</span>
              <label className="ml-auto flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked={g.isActive !== false} onChange={(e) => void update(id, { isActive: e.target.checked })} />
                Hoạt động
              </label>
            </div>
          );
        })}
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
