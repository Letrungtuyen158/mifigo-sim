"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, adminTableWrapClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";

export default function AdminSimInventoryPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: ADMIN_LIST_LIMIT, page: 1 });
  const [lowStock, setLowStock] = useState<Record<string, unknown>[]>([]);

  async function load(p = page) {
    try {
      const [inv, low] = await Promise.all([
        fetchAdminPaginated<Record<string, unknown>>("/api/admin/sim-inventory", p),
        fetch("/api/admin/sim-inventory/low-stock?threshold=10").then((r) => r.json()),
      ]);
      setItems(inv.items);
      setMeta({
        total: inv.total,
        totalPages: inv.totalPages,
        limit: inv.limit,
        page: inv.page,
      });
      setPage(inv.page);
      setLowStock(Array.isArray(low.data) ? low.data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải kho");
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Kho SIM / eSIM</h1>

      <div className="card p-4">
        <h2 className="font-bold text-amber-800">Cảnh báo tồn thấp</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {lowStock.length === 0 ? (
            <li className="text-slate-500">Không có cảnh báo.</li>
          ) : (
            lowStock.map((row, i) => (
              <li key={i}>
                Package {String((row._id as Record<string, unknown>)?.packageId || "?")} · còn{" "}
                {String(row.count)}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">ICCID</th>
              <th>Loại</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={docId(row)} className="border-t">
                <td className="py-2 font-mono text-xs">{String(row.iccid || row.serialNumber || "—")}</td>
                <td>{String(row.simType || "")}</td>
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
