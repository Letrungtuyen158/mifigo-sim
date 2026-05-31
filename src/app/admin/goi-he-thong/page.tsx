"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";

const SIM_TYPES = ["esim", "physical_sim"] as const;
const PKG_TYPES = ["data_only", "data_call", "unlimited", "daily_data"] as const;
const STATUSES = ["active", "inactive", "draft"] as const;

export default function AdminPackagesPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: ADMIN_LIST_LIMIT, page: 1 });
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

  async function load(p = page) {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/packages",
        p
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
      toast.error(e instanceof Error ? e.message : "Lỗi tải gói");
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Gói hệ thống (Package)</h1>
      <form onSubmit={(e) => void create(e)} className="card grid gap-3 p-4 sm:grid-cols-2">
        <input className={inputClass} placeholder="Tên gói" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Slug" value={form.slug} required onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className={inputClass} placeholder="countryIds (id1,id2)" value={countryIds} onChange={(e) => setCountryIds(e.target.value)} />
        <select className={inputClass} value={form.simType} onChange={(e) => setForm({ ...form, simType: e.target.value })}>
          {SIM_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={inputClass} value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })}>
          {PKG_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input className={inputClass} type="number" placeholder="Số ngày" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
        <input className={inputClass} type="number" placeholder="GB" value={form.dataAmountGb} onChange={(e) => setForm({ ...form, dataAmountGb: Number(e.target.value) })} />
        <button type="submit" className="btn-primary sm:col-span-2">Tạo gói</button>
      </form>
      <div className="space-y-2">
        {items.map((p) => {
          const id = docId(p);
          return (
            <div key={id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold">{String(p.name)}</div>
                <div className="text-xs text-slate-500">{String(p.slug)} · {String(p.simType)} · {String(p.packageType)}</div>
              </div>
              <select className={inputClass + " w-32"} defaultValue={String(p.status || "active")} onChange={(e) => void update(id, { status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          );
        })}
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
