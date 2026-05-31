"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminOnlyGate from "@/components/admin/AdminOnlyGate";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass, adminTableWrapClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";

const PAGE_TYPES = ["home", "about", "guide", "policy", "contact", "custom"] as const;
const STATUSES = ["draft", "published"] as const;

function CmsPagesAdmin() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: ADMIN_LIST_LIMIT, page: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    type: "guide" as (typeof PAGE_TYPES)[number],
    title: "",
    slug: "",
    status: "draft" as (typeof STATUSES)[number],
  });

  const load = useCallback(
    async (p: number) => {
      try {
        const extra = statusFilter ? { status: statusFilter } : undefined;
        const data = await fetchAdminPaginated<Record<string, unknown>>(
          "/api/admin/pages",
          p,
          ADMIN_LIST_LIMIT,
          extra
        );
        setItems(data.items);
        setMeta({
          total: data.total,
          totalPages: data.totalPages,
          limit: data.limit,
          page: data.page,
        });
        setPage(data.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải trang");
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  async function createPage(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        contentBlocks: [
          {
            type: "text",
            title: form.title,
            content: "",
            sortOrder: 1,
            isActive: true,
          },
        ],
      }),
    });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message || "Tạo thất bại");
    toast.success("Đã tạo trang — chỉnh nội dung sau qua PUT");
    setForm({ type: "guide", title: "", slug: "", status: "draft" });
    void load(1);
  }

  async function updatePage(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const json = (await res.json()) as { message?: string };
      return toast.error(json.message || "Cập nhật thất bại");
    }
    toast.success("Đã lưu");
    void load(page);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Trang CMS</h1>
        <p className="text-sm text-slate-600">
          CRUD qua <code className="text-xs">/admin/pages</code>. Chỉ trang{" "}
          <code className="text-xs">published</code> hiển thị trên{" "}
          <code className="text-xs">GET /public/pages/:slug</code>.
        </p>
      </div>

      <form onSubmit={(e) => void createPage(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">Tạo trang mới</h2>
        <input
          className={inputClass}
          placeholder="Tiêu đề"
          value={form.title}
          required
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="slug"
          value={form.slug}
          required
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <select
          className={inputClass}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as (typeof PAGE_TYPES)[number] })}
        >
          {PAGE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:col-span-2">
          Tạo trang
        </button>
      </form>

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Lọc trạng thái</span>
          <select
            className={inputClass}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Tiêu đề</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Loại</th>
              <th className="px-3 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const id = docId(row);
              return (
                <tr key={id} className="border-t">
                  <td className="px-3 py-2 font-medium">{String(row.title || "")}</td>
                  <td className="px-3 py-2 text-slate-600">{String(row.slug || "")}</td>
                  <td className="px-3 py-2">{String(row.type || "")}</td>
                  <td className="px-3 py-2">
                    <select
                      className={inputClass}
                      defaultValue={String(row.status || "draft")}
                      onChange={(e) => void updatePage(id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <AdminPagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default function AdminPagesRoute() {
  return (
    <AdminOnlyGate>
      <CmsPagesAdmin />
    </AdminOnlyGate>
  );
}
