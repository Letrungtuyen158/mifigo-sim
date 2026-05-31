"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { docId, inputClass } from "@/lib/admin-utils";

export default function AdminImportPage() {
  const [batches, setBatches] = useState<Record<string, unknown>[]>([]);
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [packageId, setPackageId] = useState("");

  const loadBatches = useCallback(() => {
    void fetch("/api/admin/import/batches")
      .then((r) => r.json())
      .then((d) => setBatches(Array.isArray(d.data) ? d.data : []));
  }, []);

  useEffect(() => {
    loadBatches();
    void fetch("/api/admin/suppliers")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.data) ? d.data : [];
        setSuppliers(list);
        if (list[0]) setSupplierId(docId(list[0]));
      });
  }, [loadBatches]);

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
    loadBatches();
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
            {batches.map((b) => (
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
      </div>
    </div>
  );
}
