"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { mapSystemPackageRow } from "@/lib/api/mappers";
import { inputClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { formatApiPackageType, formatDataGb, formatSimType } from "@/lib/format";

const SIM_TYPES = ["esim", "physical_sim"] as const;
const PKG_TYPES = ["data_only", "data_call", "unlimited", "daily_data"] as const;
const STATUSES = ["active", "inactive", "draft"] as const;

type SystemPackageRow = ReturnType<typeof mapSystemPackageRow>;

export default function AdminPackagesPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SystemPackageRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: ADMIN_LIST_LIMIT, page: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<(typeof STATUSES)[number] | "">("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<(typeof STATUSES)[number] | "">("");
  const [countryIds, setCountryIds] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    simType: "esim",
    packageType: "data_only",
    durationDays: 7,
    dataAmountGb: 5,
    status: "active",
  });

  const load = useCallback(
    async (p: number) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedSearch) extra.search = appliedSearch;
        if (appliedStatus) extra.status = appliedStatus;

        const data = await fetchAdminPaginated<Record<string, unknown>>(
          "/api/admin/packages",
          p,
          ADMIN_LIST_LIMIT,
          extra
        );
        setItems(data.items.map((row) => mapSystemPackageRow(row)));
        setMeta({
          total: data.total,
          totalPages: data.totalPages,
          limit: data.limit,
          page: data.page,
        });
        setPage(data.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải gói");
      }
    },
    [appliedSearch, appliedStatus]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedStatus(statusInput);
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setStatusInput("");
    setAppliedSearch("");
    setAppliedStatus("");
    setPage(1);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ids = countryIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return toast.error("Nhập countryIds (MongoId, phân cách dấu phẩy)");
    const res = await fetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, countryIds: ids }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Tạo thất bại");
    toast.success("Đã tạo gói");
    setPage(1);
    void load(1);
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/packages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu");
    void load(page);
  }

  const hasActiveFilters = Boolean(appliedSearch || appliedStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Gói hệ thống (Package)</h1>
        <p className="text-sm text-slate-600">
          Catalog gói cước — sau khi tạo cần thêm quy tắc giá bán để hiện trên website.
        </p>
      </div>

      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">Tạo gói mới</h2>
        <input className={inputClass} placeholder="Tên gói" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Slug" value={form.slug} required onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className={inputClass} placeholder="countryIds (id1,id2)" value={countryIds} onChange={(e) => setCountryIds(e.target.value)} />
        <select className={inputClass} value={form.simType} onChange={(e) => setForm({ ...form, simType: e.target.value })}>
          {SIM_TYPES.map((s) => (
            <option key={s} value={s}>{formatSimType(s)}</option>
          ))}
        </select>
        <select className={inputClass} value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })}>
          {PKG_TYPES.map((p) => (
            <option key={p} value={p}>{formatApiPackageType(p)}</option>
          ))}
        </select>
        <input className={inputClass} type="number" placeholder="Số ngày" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
        <input className={inputClass} type="number" placeholder="GB" value={form.dataAmountGb} onChange={(e) => setForm({ ...form, dataAmountGb: Number(e.target.value) })} />
        <button type="submit" className="btn-primary sm:col-span-2">Tạo gói</button>
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
            placeholder="Tên, slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold text-slate-600">Trạng thái</span>
          <select
            className={inputClass}
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as (typeof STATUSES)[number] | "")}
          >
            <option value="">Tất cả</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
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

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-500">Không có gói phù hợp.</div>
        ) : (
          items.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {p.slug} · {formatSimType(p.simType)} · {formatApiPackageType(p.packageType)} ·{" "}
                  {formatDataGb(p.dataAmountGb)} / {p.durationDays} ngày
                </div>
              </div>
              <select
                className={`${inputClass} w-32`}
                defaultValue={p.status}
                onChange={(e) => void update(p.id, { status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
      <AdminPagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
