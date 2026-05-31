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

export default function AdminCountriesPage() {
  const [list, setList] = useState<AdminPaginated<Record<string, unknown>>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    nameVi: "",
    code: "",
    slug: "",
    flagUrl: "",
    isPopular: false,
    isActive: true,
  });

  const load = useCallback(async (p = page) => {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/countries",
        p
      );
      setList(data);
      setPage(data.page);
    } catch {
      toast.error("Lỗi tải quốc gia");
    }
  }, [page]);

  useEffect(() => {
    void load(page);
  }, [page]);

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
    setPage(1);
    void load(1);
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/countries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu");
    void load(page);
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
      <div className="card overflow-x-auto p-4">
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
            {list.items.map((c) => {
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
