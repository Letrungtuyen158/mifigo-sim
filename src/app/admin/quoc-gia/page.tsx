"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { docId, inputClass } from "@/lib/admin-utils";

export default function AdminCountriesPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    name: "",
    nameVi: "",
    code: "",
    slug: "",
    flagUrl: "",
    isPopular: false,
    isActive: true,
  });

  const load = useCallback(() => {
    void fetch("/api/admin/countries")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.data) ? d.data : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo quốc gia");
    load();
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/countries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Quốc gia</h1>
      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <input className={inputClass} placeholder="Tên EN" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Tên VI" value={form.nameVi} required onChange={(e) => setForm({ ...form, nameVi: e.target.value })} />
        <input className={inputClass} placeholder="Mã (JP)" value={form.code} required onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <input className={inputClass} placeholder="Slug" value={form.slug} required onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className={inputClass} placeholder="Flag URL" value={form.flagUrl} onChange={(e) => setForm({ ...form, flagUrl: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
          Popular
        </label>
        <button type="submit" className="btn-primary sm:col-span-2">Thêm quốc gia</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Popular</th>
              <th className="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const id = docId(c);
              return (
                <tr key={id} className="border-t">
                  <td className="px-3 py-2">{String(c.nameVi || c.name)}</td>
                  <td className="px-3 py-2">{String(c.code)}</td>
                  <td className="px-3 py-2">{String(c.slug)}</td>
                  <td className="px-3 py-2">
                    <input type="checkbox" defaultChecked={!!c.isPopular} onChange={(e) => void update(id, { isPopular: e.target.checked })} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="checkbox" defaultChecked={c.isActive !== false} onChange={(e) => void update(id, { isActive: e.target.checked })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
