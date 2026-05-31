"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { fetchAdminSuppliers, fetchPackageSelectOptions } from "@/lib/admin-pricing";
import { docId, inputClass, adminTableWrapClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { formatSimInventoryStatus, formatSimType } from "@/lib/format";
import type { Supplier } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;

const SIM_TYPES = ["", "esim", "physical_sim"] as const;
const INVENTORY_STATUSES = [
  "",
  "available",
  "reserved",
  "sold",
  "expired",
  "disabled",
] as const;

function refName(ref: unknown): string {
  if (!ref || typeof ref !== "object") return "—";
  const name = (ref as Record<string, unknown>).name;
  return name ? String(name) : "—";
}

export default function AdminSimInventoryPage() {
  const [page, setPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [lowStockItems, setLowStockItems] = useState<Record<string, unknown>[]>([]);
  const [lowStockMeta, setLowStockMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });

  const [packageOptions, setPackageOptions] = useState<{ id: string; label: string }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [packageInput, setPackageInput] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [simTypeInput, setSimTypeInput] = useState("");
  const [statusInput, setStatusInput] = useState<(typeof INVENTORY_STATUSES)[number]>("");

  const [appliedPackageId, setAppliedPackageId] = useState("");
  const [appliedSupplierId, setAppliedSupplierId] = useState("");
  const [appliedSimType, setAppliedSimType] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<(typeof INVENTORY_STATUSES)[number]>("");

  useEffect(() => {
    const simType = new URLSearchParams(window.location.search).get("simType");
    if (simType === "esim" || simType === "physical_sim") {
      setSimTypeInput(simType);
      setAppliedSimType(simType);
    }
  }, []);

  useEffect(() => {
    void Promise.all([fetchPackageSelectOptions(), fetchAdminSuppliers()])
      .then(([pkgOpts, supplierList]) => {
        setPackageOptions(pkgOpts);
        setSuppliers(supplierList);
      })
      .catch(() => toast.error("Lỗi tải gói/NCC"));
  }, []);

  const loadInventory = useCallback(
    async (p: number) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedPackageId) extra.packageId = appliedPackageId;
        if (appliedSupplierId) extra.supplierId = appliedSupplierId;
        if (appliedSimType) extra.simType = appliedSimType;
        if (appliedStatus) extra.status = appliedStatus;

        const inv = await fetchAdminPaginated<Record<string, unknown>>(
          "/api/admin/sim-inventory",
          p,
          ADMIN_LIST_LIMIT,
          extra
        );
        setItems(inv.items);
        setMeta({
          total: inv.total,
          totalPages: inv.totalPages,
          limit: inv.limit,
          page: inv.page,
        });
        setPage(inv.page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi tải kho");
      }
    },
    [appliedPackageId, appliedSupplierId, appliedSimType, appliedStatus]
  );

  const loadLowStock = useCallback(async (p: number) => {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/sim-inventory/low-stock",
        p,
        ADMIN_LIST_LIMIT,
        { threshold: LOW_STOCK_THRESHOLD }
      );
      setLowStockItems(data.items);
      setLowStockMeta({
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
        page: data.page,
      });
      setLowStockPage(data.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải cảnh báo tồn");
    }
  }, []);

  useEffect(() => {
    void loadInventory(page);
  }, [page, loadInventory]);

  useEffect(() => {
    void loadLowStock(lowStockPage);
  }, [lowStockPage, loadLowStock]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedPackageId(packageInput);
    setAppliedSupplierId(supplierInput);
    setAppliedSimType(simTypeInput);
    setAppliedStatus(statusInput);
    setPage(1);
  }

  function resetFilters() {
    setPackageInput("");
    setSupplierInput("");
    setSimTypeInput("");
    setStatusInput("");
    setAppliedPackageId("");
    setAppliedSupplierId("");
    setAppliedSimType("");
    setAppliedStatus("");
    setPage(1);
  }

  const hasActiveFilters = Boolean(
    appliedPackageId || appliedSupplierId || appliedSimType || appliedStatus
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Kho SIM / eSIM</h1>
        <p className="text-sm text-slate-600">
          Lọc theo gói cước, NCC, loại SIM hoặc trạng thái tồn kho.
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="w-full sm:min-w-[200px] sm:flex-1">
          <span className="mb-1 block text-xs font-bold text-slate-600">Gói cước</span>
          <select
            className={inputClass}
            value={packageInput}
            onChange={(e) => setPackageInput(e.target.value)}
          >
            <option value="">Tất cả gói</option>
            {packageOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full sm:min-w-[180px] sm:flex-1">
          <span className="mb-1 block text-xs font-bold text-slate-600">Nhà cung cấp</span>
          <select
            className={inputClass}
            value={supplierInput}
            onChange={(e) => setSupplierInput(e.target.value)}
          >
            <option value="">Tất cả NCC</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold text-slate-600">Loại SIM</span>
          <select
            className={inputClass}
            value={simTypeInput}
            onChange={(e) => setSimTypeInput(e.target.value)}
          >
            <option value="">Tất cả</option>
            {SIM_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {formatSimType(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold text-slate-600">Trạng thái</span>
          <select
            className={inputClass}
            value={statusInput}
            onChange={(e) =>
              setStatusInput(e.target.value as (typeof INVENTORY_STATUSES)[number])
            }
          >
            <option value="">Tất cả</option>
            {INVENTORY_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {formatSimInventoryStatus(s)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2 text-sm">
            Lọc
          </button>
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

      <div className="card p-4">
        <h2 className="font-bold text-amber-800">
          Cảnh báo tồn thấp (≤ {LOW_STOCK_THRESHOLD} SIM)
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {lowStockItems.length === 0 ? (
            <li className="text-slate-500">Không có cảnh báo.</li>
          ) : (
            lowStockItems.map((row, i) => (
              <li key={i} className="admin-break-text">
                Package {String((row._id as Record<string, unknown>)?.packageId || "?")} ·{" "}
                {formatSimType(String((row._id as Record<string, unknown>)?.simType || ""))} · còn{" "}
                {String(row.count)}
              </li>
            ))
          )}
        </ul>
        <AdminPagination
          page={lowStockMeta.page}
          limit={lowStockMeta.limit}
          total={lowStockMeta.total}
          totalPages={lowStockMeta.totalPages}
          onPageChange={setLowStockPage}
        />
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Không có SIM phù hợp bộ lọc.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Tên gói</th>
                <th>NCC</th>
                <th>ICCID</th>
                <th>Loại</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={docId(row)} className="border-t">
                  <td className="py-2">{refName(row.packageId)}</td>
                  <td className="py-2">{refName(row.supplierId)}</td>
                  <td className="py-2 font-mono text-xs">
                    {String(row.iccid || row.serialNumber || "—")}
                  </td>
                  <td>{formatSimType(String(row.simType || ""))}</td>
                  <td>{formatSimInventoryStatus(String(row.status || ""))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
