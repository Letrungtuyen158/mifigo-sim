"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ExcelFilePicker from "@/components/admin/ExcelFilePicker";
import { fetchAdminSuppliers, fetchPackageSelectOptions } from "@/lib/admin-pricing";
import { inputClass } from "@/lib/admin-utils";
import type { Supplier } from "@/lib/types";

export default function AdminEsimVnPage() {
  const [importing, setImporting] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
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

  async function runImport() {
    if (!excelFile) {
      toast.error("Vui lòng chọn file Excel.");
      return;
    }
    if (!packageId || !supplierId) {
      toast.error("Vui lòng chọn gói cước và nhà cung cấp.");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("packageId", packageId);
      formData.append("supplierId", supplierId);
      const res = await fetch("/api/esim-vn", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import thất bại");
      toast.success(`Đã import ${data.imported} eSIM`);
      setExcelFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import lỗi");
    } finally {
      setImporting(false);
    }
  }

  const canPickFile = Boolean(packageId && supplierId) && !importing;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Import eSIM Việt Nam</h1>
        <p className="text-sm text-slate-600">
          Upload file Excel (.xlsx). Cột gợi ý: ICCID, Phone, Serial, QR, Activation Code, Plan,
          Notes.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Gói cước</span>
            <select
              className={inputClass}
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
            <span className="mb-1 block font-semibold">Nhà cung cấp</span>
            <select
              className={inputClass}
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

        <ExcelFilePicker
          file={excelFile}
          disabled={!canPickFile && !excelFile}
          onChange={setExcelFile}
          label="File Excel *"
          buttonLabel="Chọn file Excel"
          hint="Kéo thả hoặc bấm để chọn (.xlsx, .xls)"
          removeLabel="Xóa file"
        />

        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={importing || !excelFile || !packageId || !supplierId}
          onClick={() => void runImport()}
        >
          {importing ? "Đang import…" : "Import eSIM"}
        </button>
      </div>
    </div>
  );
}
