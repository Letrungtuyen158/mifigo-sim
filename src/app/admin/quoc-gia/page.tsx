"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminWriteGate from "@/components/admin/AdminWriteGate";
import StaffReadOnlyBanner from "@/components/admin/StaffReadOnlyBanner";
import AdminPagination from "@/components/admin/AdminPagination";
import { useCanAdminWrite } from "@/contexts/AdminRoleContext";
import { docId, inputClass, adminTableWrapClass } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";

type BoolFilter = "" | "true" | "false";

export default function AdminCountriesPage() {
  const canWrite = useCanAdminWrite();
  const [list, setList] = useState<AdminPaginated<Record<string, unknown>>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [popularInput, setPopularInput] = useState<BoolFilter>("");
  const [activeInput, setActiveInput] = useState<BoolFilter>("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedPopular, setAppliedPopular] = useState<BoolFilter>("");
  const [appliedActive, setAppliedActive] = useState<BoolFilter>("");
  const [form, setForm] = useState({
    name: "",
    nameVi: "",
    code: "",
    slug: "",
    flagUrl: "",
    isPopular: false,
    isActive: true,
  });

  const load = useCallback(
    async (p: number) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedSearch) extra.search = appliedSearch;
        if (appliedPopular) extra.isPopular = appliedPopular;
        if (appliedActive) extra.isActive = appliedActive;

        const data = await fetchAdminPaginated<Record<string, unknown>>(
          "/api/admin/countries",
          p,
          ADMIN_LIST_LIMIT,
          extra
        );
        setList(data);
        setPage(data.page);
      } catch {
        toast.error("Lỗi tải quốc gia");
      }
    },
    [appliedSearch, appliedPopular, appliedActive]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedPopular(popularInput);
    setAppliedActive(activeInput);
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setPopularInput("");
    setActiveInput("");
    setAppliedSearch("");
    setAppliedPopular("");
    setAppliedActive("");
    setPage(1);
  }

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

  const hasActiveFilters = Boolean(appliedSearch || appliedPopular || appliedActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Quốc gia</h1>
        <p className="text-sm text-slate-600">
          Tìm theo tên, mã ISO hoặc slug; lọc popular / trạng thái active.
        </p>
      </div>

      <StaffReadOnlyBanner />

      <AdminWriteGate>
      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">Thêm quốc gia</h2>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-bold text-slate-600">Tên EN</span>
          <input
            className={inputClass}
            placeholder="Japan"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-bold text-slate-600">Tên VI</span>
          <input
            className={inputClass}
            placeholder="Nhật Bản"
            value={form.nameVi}
            required
            onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-bold text-slate-600">Mã ISO</span>
          <input
            className={inputClass}
            placeholder="JP"
            value={form.code}
            required
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-bold text-slate-600">Slug</span>
          <input
            className={inputClass}
            placeholder="nhat-ban"
            value={form.slug}
            required
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-xs font-bold text-slate-600">Flag URL</span>
          <input
            className={inputClass}
            placeholder="https://..."
            value={form.flagUrl}
            onChange={(e) => setForm({ ...form, flagUrl: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
          Popular
        </label>
        <button type="submit" className="btn-primary sm:col-span-2">Thêm quốc gia</button>
      </form>
      </AdminWriteGate>

      <form
        onSubmit={applyFilters}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="min-w-0 flex-1 sm:min-w-[220px]">
          <span className="mb-1 block text-xs font-bold text-slate-600">Tìm kiếm</span>
          <input
            type="search"
            className={inputClass}
            placeholder="Tên, mã ISO, slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold text-slate-600">Popular</span>
          <select
            className={inputClass}
            value={popularInput}
            onChange={(e) => setPopularInput(e.target.value as BoolFilter)}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </label>
        <label className="w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold text-slate-600">Active</span>
          <select
            className={inputClass}
            value={activeInput}
            onChange={(e) => setActiveInput(e.target.value as BoolFilter)}
          >
            <option value="">Tất cả</option>
            <option value="true">Đang bật</option>
            <option value="false">Đã tắt</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2 text-sm">Lọc</button>
          {hasActiveFilters ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={resetFilters}
            >
              Xóa lọc
            </button>
          ) : null}
        </div>
      </form>

      <div className={`card ${adminTableWrapClass} p-4`}>
        <table className="min-w-[520px] w-full text-sm">
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
            {list.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Không có quốc gia phù hợp.
                </td>
              </tr>
            ) : (
              list.items.map((c) => {
                const id = docId(c);
                return (
                  <tr key={id} className="border-t">
                    <td className="px-3 py-2">{String(c.nameVi || c.name)}</td>
                    <td className="px-3 py-2">{String(c.code)}</td>
                    <td className="px-3 py-2">{String(c.slug)}</td>
                    <td className="px-3 py-2">
                      {canWrite ? (
                        <input type="checkbox" defaultChecked={!!c.isPopular} onChange={(e) => void update(id, { isPopular: e.target.checked })} />
                      ) : (
                        c.isPopular ? "Có" : "Không"
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {canWrite ? (
                        <input type="checkbox" defaultChecked={c.isActive !== false} onChange={(e) => void update(id, { isActive: e.target.checked })} />
                      ) : (
                        c.isActive !== false ? "Bật" : "Tắt"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
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
