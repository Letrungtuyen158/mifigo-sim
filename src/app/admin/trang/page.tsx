"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { docId, inputClass } from "@/lib/admin-utils";

const PAGE_TYPES = ["home", "about", "guide", "policy", "contact", "custom"] as const;
const STATUSES = ["draft", "published"] as const;

export default function AdminPagesPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ type: "custom", title: "", slug: "", status: "draft" });

  const load = useCallback(() => {
    void fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.data) ? d.data : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo trang");
    load();
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/pages/${id}`, {
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
      <h1 className="text-2xl font-black">Trang CMS</h1>
      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {PAGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input className={inputClass} placeholder="Tiêu đề" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={inputClass} placeholder="Slug" value={form.slug} required onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <button type="submit" className="btn-primary sm:col-span-2">Tạo trang</button>
      </form>
      <div className="space-y-2">
        {items.map((p) => {
          const id = docId(p);
          return (
            <div key={id} className="card flex flex-wrap items-center gap-3 p-4">
              <div>
                <div className="font-bold">{String(p.title)}</div>
                <div className="text-sm text-slate-500">/{String(p.slug)} · {String(p.type)}</div>
              </div>
              <select className={inputClass + " ml-auto w-36"} defaultValue={String(p.status)} onChange={(e) => void update(id, { status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <a href={`/trang/${String(p.slug)}`} target="_blank" className="text-sm text-[#1d6be8]">Xem public</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
