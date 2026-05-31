"use client";

import { useEffect, useState } from "react";
import { docId } from "@/lib/admin-utils";

export default function AdminActivityLogsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void fetch("/api/admin/activity-logs?limit=50")
      .then((r) => r.json())
      .then((d) => setItems(d.data?.items || []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Nhật ký hoạt động</h1>
      <div className="card overflow-x-auto p-4">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Thời gian</th>
              <th>Hành động</th>
              <th>Người thực hiện</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => {
              const actor = log.actorId as Record<string, unknown> | undefined;
              return (
                <tr key={docId(log)} className="border-t">
                  <td className="py-2 text-xs">{String(log.createdAt || "")}</td>
                  <td>{String(log.action || log.type || "")}</td>
                  <td>{actor ? String(actor.fullName || actor.email || "") : "—"}</td>
                  <td className="max-w-xs truncate text-xs">{String(log.description || log.metadata || "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
