"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminSuppliers, fetchPackageSelectOptions } from "@/lib/admin-pricing";
import type { Supplier } from "@/lib/types";

export default function AdminEsimVnPage() {
  const [importing, setImporting] = useState(false);
  const [packageOptions, setPackageOptions] = useState<{ id: string; label: string }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [packageId, setPackageId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  useEffect(() => {
    void Promise.all([fetchPackageSelectOptions(), fetchAdminSuppliers()])
      .then(([pkgOpts, supplierList]) => {
        setPackageOptions(pkgOpts);
        setSuppliers(supplierList);
        if (pkgOpts.length > 0) setPackageId(pkgOpts[0].id);
        if (supplierList.length > 0) setSupplierId(supplierList[0].id);
      })
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Lỗi tải danh sách gói/NCC")
      );
  }, []);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!packageId || !supplierId) {
      toast.error("Vui lòng chọn gói cước và nhà cung cấp.");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("packageId", packageId);
      formData.append("supplierId", supplierId);
      const res = await fetch("/api/esim-vn", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import thất bại");
      toast.success(`Đã import ${data.imported} eSIM`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import lỗi");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Import eSIM Việt Nam</h1>
        <p className="text-sm text-slate-600">
          Upload file Excel (.xlsx). Cột gợi ý: ICCID, Phone, Serial, QR, Activation Code, Plan, Notes.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold">Gói cước</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              disabled={importing || packageOptions.length === 0}
            >
              {packageOptions.length === 0 ? (
                <option value="">Chưa có gói — tạo gói ở Admin trước</option>
              ) : (
                packageOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Nhà cung cấp</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={importing || suppliers.length === 0}
            >
              {suppliers.length === 0 ? (
                <option value="">Chưa có NCC</option>
              ) : (
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls"
          disabled={importing || !packageId || !supplierId}
          onChange={(e) => void handleImport(e)}
        />
        <p className="text-xs text-slate-500">
          API yêu cầu <code>file</code>, <code>simType=esim</code>, <code>packageId</code>,{" "}
          <code>supplierId</code> (multipart).
        </p>
      </div>
    </div>
  );
}
