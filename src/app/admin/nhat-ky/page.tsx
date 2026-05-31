"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";

export default function AdminActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: ADMIN_LIST_LIMIT, page: 1 });

  async function load(p = page) {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/activity-logs",
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
      toast.error(e instanceof Error ? e.message : "Lỗi tải nhật ký");
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

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
