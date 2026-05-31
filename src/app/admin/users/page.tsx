"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { docId, inputClass } from "@/lib/admin-utils";

type UserRow = Record<string, unknown>;

const ROLES = ["customer", "agent", "collaborator", "staff", "admin"] as const;
const STATUSES = ["active", "inactive", "blocked"] as const;

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });

  const load = useCallback(() => {
    void fetch("/api/admin/users?limit=50")
      .then((r) => r.json())
      .then((d) => setItems(d.data?.items || d.data || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo người dùng");
    setForm({ fullName: "", email: "", password: "", phone: "", role: "customer" });
    load();
  }

  async function updateUser(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Cập nhật thất bại");
      return;
    }
    toast.success("Đã lưu");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Người dùng</h1>

      <form onSubmit={(e) => void createUser(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">Tạo mới</h2>
        <input className={inputClass} placeholder="Họ tên" value={form.fullName} required onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className={inputClass} type="email" placeholder="Email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={inputClass} type="password" placeholder="Mật khẩu (≥6)" value={form.password} required minLength={6} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input className={inputClass} placeholder="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:col-span-2">Tạo user</button>
      </form>

      <div className="space-y-3">
        {items.map((u) => {
          const id = docId(u);
          return (
            <div key={id} className="card grid gap-2 p-4 sm:grid-cols-4">
              <div className="font-semibold">{String(u.fullName || "")}</div>
              <div className="text-sm text-slate-600">{String(u.email || "")}</div>
              <select
                className={inputClass}
                defaultValue={String(u.role || "customer")}
                onChange={(e) => void updateUser(id, { role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                className={inputClass}
                defaultValue={String(u.status || "active")}
                onChange={(e) => void updateUser(id, { status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
