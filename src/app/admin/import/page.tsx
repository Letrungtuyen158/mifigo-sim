"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass, adminTableWrapClass } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminListItems,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";

export default function AdminImportPage() {
  const [list, setList] = useState<AdminPaginated<Record<string, unknown>>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [packageId, setPackageId] = useState("");

  const loadBatches = useCallback(async (p = page) => {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/import/batches",
        p
      );
      setList(data);
      setPage(data.page);
    } catch {
      toast.error("Lỗi tải lịch sử import");
    }
  }, [page]);

  useEffect(() => {
    void loadBatches(page);
  }, [page]);

  useEffect(() => {
    void fetchAdminListItems<Record<string, unknown>>("/api/admin/suppliers", 100)
      .then((data) => {
        setSuppliers(data);
        if (data[0]) setSupplierId(docId(data[0]));
      })
      .catch(() => toast.error("Lỗi tải NCC"));
  }, []);

  async function importPrices(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supplierId) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("supplierId", supplierId);
    if (packageId.trim()) fd.set("packageId", packageId.trim());
    const res = await fetch("/api/admin/import/supplier-prices", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Import thất bại");
    toast.success(`Import xong: ${data.data?.successRows ?? 0} dòng OK`);
    setPage(1);
    void loadBatches(1);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Import dữ liệu</h1>

      <div className="card space-y-3 p-5">
        <h2 className="font-bold">Import giá nhà cung cấp (Excel)</h2>
        <select className={inputClass} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          {suppliers.map((s) => (
            <option key={docId(s)} value={docId(s)}>{String(s.name)} ({String(s.code)})</option>
          ))}
        </select>
        <input className={inputClass} placeholder="packageId mặc định (tùy chọn)" value={packageId} onChange={(e) => setPackageId(e.target.value)} />
        <input type="file" accept=".xlsx,.xls" onChange={(e) => void importPrices(e)} />
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        <h2 className="mb-3 font-bold">Lịch sử import</h2>
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">File</th>
              <th>Loại</th>
              <th>OK</th>
              <th>Lỗi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((b) => (
              <tr key={docId(b)} className="border-t">
                <td className="py-2">{String(b.fileName)}</td>
                <td>{String(b.type)}</td>
                <td>{String(b.successRows)}</td>
                <td>{String(b.failedRows)}</td>
                <td>{String(b.status)}</td>
              </tr>
            ))}
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
