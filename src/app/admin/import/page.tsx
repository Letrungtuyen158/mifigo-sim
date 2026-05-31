"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { docId, inputClass } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminArray, normalizePaginated } from "@/lib/admin-list";

export default function AdminImportPage() {
  const [allBatches, setAllBatches] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [packageId, setPackageId] = useState("");

  const list = useMemo(
    () => normalizePaginated<Record<string, unknown>>(allBatches, page, ADMIN_LIST_LIMIT),
    [allBatches, page]
  );

  useEffect(() => {
    void fetchAdminArray<Record<string, unknown>>("/api/admin/import/batches")
      .then(setAllBatches)
      .catch(() => toast.error("Lỗi tải lịch sử import"));
    void fetchAdminArray<Record<string, unknown>>("/api/admin/suppliers")
      .then((data) => {
        setSuppliers(data);
        if (data[0]) setSupplierId(docId(data[0]));
      });
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
    setAllBatches(await fetchAdminArray<Record<string, unknown>>("/api/admin/import/batches"));
    setPage(1);
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

      <div className="card overflow-x-auto p-4">
        <h2 className="mb-3 font-bold">Lịch sử import</h2>
        <p className="mb-2 text-xs text-slate-500">BE trả tối đa 50 batch gần nhất.</p>
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
