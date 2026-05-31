"use client";

import { useCallback, useEffect, useState } from "react";
import { docId } from "@/lib/admin-utils";

export default function AdminSimInventoryPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [lowStock, setLowStock] = useState<Record<string, unknown>[]>([]);

  const load = useCallback(() => {
    void Promise.all([
      fetch("/api/admin/sim-inventory?limit=50").then((r) => r.json()),
      fetch("/api/admin/sim-inventory/low-stock?threshold=10").then((r) => r.json()),
    ]).then(([inv, low]) => {
      setItems(inv.data?.items || []);
      setLowStock(Array.isArray(low.data) ? low.data : []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
                Package {String((row._id as Record<string, unknown>)?.packageId || "?")} ·{" "}
                {String((row._id as Record<string, unknown>)?.simType || "")} · còn {String(row.count)}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="card overflow-x-auto p-4">
        <h2 className="mb-3 font-bold">Tồn kho (50 mới nhất)</h2>
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
      </div>
    </div>
  );
}
