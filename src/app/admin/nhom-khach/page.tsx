"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { docId, inputClass } from "@/lib/admin-utils";

const TYPES = ["retail", "agent", "collaborator", "vip"] as const;

export default function AdminCustomerGroupsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ name: "", code: "", type: "retail", description: "" });

  const load = useCallback(() => {
    void fetch("/api/admin/customer-groups")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.data) ? d.data : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    load();
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/customer-groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return toast.error("Cập nhật thất bại");
    toast.success("Đã lưu");
    load();
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
      <div className="space-y-2">
        {items.map((g) => {
          const id = docId(g);
          return (
            <div key={id} className="card flex flex-wrap items-center gap-3 p-4">
              <span className="font-bold">{String(g.name)}</span>
              <span className="text-sm text-slate-500">{String(g.code)} · {String(g.type)}</span>
              <label className="ml-auto flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked={g.isActive !== false} onChange={(e) => void update(id, { isActive: e.target.checked })} />
                Hoạt động
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
