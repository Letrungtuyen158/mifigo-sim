"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated, type AdminPaginated } from "@/lib/admin-list";
import { formatUserRole, formatUserStatus } from "@/lib/format";

type UserRow = Record<string, unknown>;

const ROLES = ["customer", "agent", "collaborator", "staff", "admin"] as const;
const STATUSES = ["active", "inactive", "blocked"] as const;

export default function AdminUsersPage() {
  const [list, setList] = useState<AdminPaginated<UserRow>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [roleInput, setRoleInput] = useState<(typeof ROLES)[number] | "">("");
  const [statusInput, setStatusInput] = useState<(typeof STATUSES)[number] | "">("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRole, setAppliedRole] = useState<(typeof ROLES)[number] | "">("");
  const [appliedStatus, setAppliedStatus] = useState<(typeof STATUSES)[number] | "">("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });

  const load = useCallback(
    async (p: number) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedSearch) extra.search = appliedSearch;
        if (appliedRole) extra.role = appliedRole;
        if (appliedStatus) extra.status = appliedStatus;

        const data = await fetchAdminPaginated<UserRow>("/api/admin/users", p, ADMIN_LIST_LIMIT, extra);
        setList(data);
        setPage(data.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      }
    },
    [appliedSearch, appliedRole, appliedStatus]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedRole(roleInput);
    setAppliedStatus(statusInput);
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setRoleInput("");
    setStatusInput("");
    setAppliedSearch("");
    setAppliedRole("");
    setAppliedStatus("");
    setPage(1);
  }

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
    setPage(1);
    void load(1);
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
    void load(page);
  }

  const hasActiveFilters = Boolean(appliedSearch || appliedRole || appliedStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Người dùng</h1>
        <p className="text-sm text-slate-600">
          Lọc theo tên, email, SĐT, role hoặc trạng thái tài khoản.
        </p>
      </div>

      <form onSubmit={(e) => void createUser(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">Tạo mới</h2>
        <input className={inputClass} placeholder="Họ tên" value={form.fullName} required onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className={inputClass} type="email" placeholder="Email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={inputClass} type="password" placeholder="Mật khẩu (≥6)" value={form.password} required minLength={6} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input className={inputClass} placeholder="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{formatUserRole(r)}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:col-span-2">Tạo user</button>
      </form>

      <form
        onSubmit={applyFilters}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="min-w-0 flex-1 sm:min-w-[220px]">
          <span className="mb-1 block text-xs font-bold text-slate-600">Tìm kiếm</span>
          <input
            type="search"
            className={inputClass}
            placeholder="Tên, email, SĐT…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold text-slate-600">Role</span>
          <select
            className={inputClass}
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value as (typeof ROLES)[number] | "")}
          >
            <option value="">Tất cả</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{formatUserRole(r)}</option>
            ))}
          </select>
        </label>
        <label className="w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold text-slate-600">Trạng thái</span>
          <select
            className={inputClass}
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as (typeof STATUSES)[number] | "")}
          >
            <option value="">Tất cả</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{formatUserStatus(s)}</option>
            ))}
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

      <div className="card space-y-3 p-4">
        {list.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Không có người dùng phù hợp.</p>
        ) : (
          list.items.map((u) => {
            const id = docId(u);
            return (
              <div key={id} className="grid min-w-0 gap-2 border-b border-slate-100 pb-3 last:border-0 sm:grid-cols-4">
                <div>
                  <div className="font-semibold">{String(u.fullName || "")}</div>
                  {u.phone ? (
                    <div className="text-xs text-slate-500">{String(u.phone)}</div>
                  ) : null}
                </div>
                <div className="text-sm text-slate-600">{String(u.email || "")}</div>
                <select
                  className={inputClass}
                  defaultValue={String(u.role || "customer")}
                  onChange={(e) => void updateUser(id, { role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{formatUserRole(r)}</option>
                  ))}
                </select>
                <select
                  className={inputClass}
                  defaultValue={String(u.status || "active")}
                  onChange={(e) => void updateUser(id, { status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{formatUserStatus(s)}</option>
                  ))}
                </select>
              </div>
            );
          })
        )}
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
