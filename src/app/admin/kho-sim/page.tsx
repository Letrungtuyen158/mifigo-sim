"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, adminTableWrapClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { formatSimType } from "@/lib/format";

const LOW_STOCK_THRESHOLD = 10;

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

  const loadInventory = useCallback(async (p: number) => {
    try {
      const inv = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/sim-inventory",
        p
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
  }, []);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Kho SIM / eSIM</h1>

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
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Tên gói</th>
              <th>ICCID</th>
              <th>Loại</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={docId(row)} className="border-t">
                <td className="py-2">{refName(row.packageId)}</td>
                <td className="py-2 font-mono text-xs">
                  {String(row.iccid || row.serialNumber || "—")}
                </td>
                <td>{formatSimType(String(row.simType || ""))}</td>
                <td>{String(row.status || "")}</td>
              </tr>
            ))}
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
