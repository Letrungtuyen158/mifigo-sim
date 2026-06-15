"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminOnlyGate from "@/components/admin/AdminOnlyGate";
import AdminPagination from "@/components/admin/AdminPagination";
import ExcelFilePicker from "@/components/admin/ExcelFilePicker";
import ImportBatchResultCard from "@/components/admin/ImportBatchResultCard";
import ImportTemplateDownloadButton from "@/components/admin/ImportTemplateDownloadButton";
import {
  simTypeToImportTemplate,
  simTypeToSupplierPackagesTemplate,
  SIM_INVENTORY_ESIM_HEADERS,
  SIM_INVENTORY_PHYSICAL_HEADERS,
  SUPPLIER_PACKAGES_IMPORT_HEADERS,
  SUPPLIER_PRICE_IMPORT_HEADERS,
} from "@/lib/admin-import-templates";
import { fetchAdminSuppliers, fetchPackageSelectOptions } from "@/lib/admin-pricing";
import { docId, inputClass, adminTableWrapClass, mongoIdString } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";
import { formatSimType } from "@/lib/format";
import type { ImportBatch, ImportBatchType } from "@/lib/import-types";
import type { Supplier } from "@/lib/types";

type BatchTypeFilter = "" | ImportBatchType;

const BATCH_TYPE_LABEL: Record<string, string> = {
  supplier_packages: "Gói cước NCC",
  supplier_price: "Giá NCC",
  sim_inventory: "Kho SIM/eSIM",
};

const BATCH_STATUS_CLASS: Record<string, string> = {
  processing: "bg-amber-50 text-amber-800 ring-amber-200/80",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  failed: "bg-red-50 text-red-800 ring-red-200/80",
};

const BATCH_STATUS_LABEL: Record<string, string> = {
  processing: "Đang xử lý",
  completed: "Hoàn tất",
  failed: "Thất bại",
};

const SUPPLIER_PRICE_COLUMNS = [
  "package_slug hoặc package_id",
  ...SUPPLIER_PRICE_IMPORT_HEADERS.filter((h) => h !== "package_slug" && h !== "package_id"),
];

const SIM_INVENTORY_ESIM_COLUMNS = [...SIM_INVENTORY_ESIM_HEADERS];
const SIM_INVENTORY_PHYSICAL_COLUMNS = [...SIM_INVENTORY_PHYSICAL_HEADERS];

function batchStatusBadgeClass(batch: Record<string, unknown>) {
  const status = String(batch.status || "");
  if (status === "completed" && Number(batch.failedRows) > 0) {
    return "bg-amber-50 text-amber-900 ring-amber-200/80";
  }
  return BATCH_STATUS_CLASS[status] ?? "bg-slate-100 text-slate-700 ring-slate-200/80";
}

function batchStatusLabel(batch: Record<string, unknown>) {
  const status = String(batch.status || "");
  if (status === "completed" && Number(batch.failedRows) > 0) return "Hoàn tất (có lỗi)";
  return BATCH_STATUS_LABEL[status] || status;
}

function formatUploadedBy(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return String(o.fullName || o.email || "—");
  }
  return "—";
}

function supplierLabel(supplierId: unknown, suppliers: Supplier[]): string {
  const id = mongoIdString(supplierId);
  if (!id) return "—";
  const match = suppliers.find((s) => s.id === id);
  return match ? match.name : id;
}

function formatBatchTime(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

function isXlsxFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".xlsx");
}

function AdminImportContent() {
  const [batchType, setBatchType] = useState<BatchTypeFilter>("");
  const [list, setList] = useState<AdminPaginated<Record<string, unknown>>>({
    items: [],
    total: 0,
    page: 1,
    limit: ADMIN_LIST_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [detailBatch, setDetailBatch] = useState<ImportBatch | null>(null);

  const [pkgSimType, setPkgSimType] = useState<"esim" | "physical_sim">("esim");
  const [pkgSupplierId, setPkgSupplierId] = useState("");
  const [pkgFile, setPkgFile] = useState<File | null>(null);
  const [pkgImporting, setPkgImporting] = useState(false);
  const [pkgResult, setPkgResult] = useState<ImportBatch | null>(null);

  const [supplierId, setSupplierId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [inventoryImporting, setInventoryImporting] = useState(false);
  const [packageOptions, setPackageOptions] = useState<{ id: string; label: string }[]>([]);
  const [simType, setSimType] = useState<"esim" | "physical_sim">("esim");
  const [inventoryPackageId, setInventoryPackageId] = useState("");
  const [inventorySupplierId, setInventorySupplierId] = useState("");
  const [inventoryFile, setInventoryFile] = useState<File | null>(null);

  const loadBatches = useCallback(async (p: number, type = batchType) => {
    try {
      const extra = type ? { type } : undefined;
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/import/batches",
        p,
        ADMIN_LIST_LIMIT,
        extra
      );
      setList(data);
      setPage(data.page);
    } catch {
      toast.error("Lỗi tải lịch sử import");
    }
  }, [batchType]);

  useEffect(() => {
    void loadBatches(page, batchType);
  }, [page, batchType, loadBatches]);

  useEffect(() => {
    setSuppliersLoading(true);
    void Promise.all([fetchAdminSuppliers(), fetchPackageSelectOptions()])
      .then(([data, pkgOpts]) => {
        setSuppliers(data);
        setPackageOptions(pkgOpts);
        if (data[0]) {
          setPkgSupplierId(data[0].id);
          setSupplierId(data[0].id);
          setInventorySupplierId(data[0].id);
        }
        if (pkgOpts[0]) setInventoryPackageId(pkgOpts[0].id);
      })
      .catch(() => toast.error("Lỗi tải NCC"))
      .finally(() => setSuppliersLoading(false));
  }, []);

  async function runSupplierPackagesImport() {
    if (!pkgFile) {
      toast.error("Vui lòng chọn file Excel.");
      return;
    }
    if (!isXlsxFile(pkgFile)) {
      toast.error("Chỉ chấp nhận file .xlsx.");
      return;
    }
    if (!pkgSupplierId) {
      toast.error("Vui lòng chọn nhà cung cấp.");
      return;
    }

    setPkgImporting(true);
    setPkgResult(null);
    try {
      const fd = new FormData();
      fd.set("file", pkgFile);
      fd.set("simType", pkgSimType);
      fd.set("supplierId", pkgSupplierId);

      const res = await fetch("/api/admin/import/supplier-packages", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: ImportBatch;
        message?: string;
      };

      if (!res.ok) {
        toast.error(json.message || "Import thất bại");
        return;
      }

      const batch = json.data;
      if (batch) {
        setPkgResult(batch);
        const failed = batch.failedRows ?? 0;
        const ok = batch.successRows ?? 0;
        if (failed > 0) {
          toast.success(`Import xong: ${ok} dòng OK, ${failed} lỗi`);
        } else {
          toast.success(`Import xong: ${ok} dòng OK`);
        }
      } else {
        toast.success("Import thành công");
      }

      setPkgFile(null);
      setPage(1);
      void loadBatches(1);
    } catch {
      toast.error("Import thất bại");
    } finally {
      setPkgImporting(false);
    }
  }

  async function runImport() {
    if (!excelFile) {
      toast.error("Vui lòng chọn file Excel.");
      return;
    }
    if (!supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp.");
      return;
    }

    setImporting(true);
    try {
      const fd = new FormData();
      fd.set("file", excelFile);
      fd.set("supplierId", supplierId);
      if (packageId.trim()) fd.set("packageId", packageId.trim());

      const res = await fetch("/api/admin/import/supplier-prices", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { successRows?: number; failedRows?: number };
        message?: string;
      };

      if (!res.ok) {
        toast.error(json.message || "Import thất bại");
        return;
      }

      const ok = json.data?.successRows ?? 0;
      const failed = json.data?.failedRows ?? 0;
      if (failed > 0) {
        toast.success(`Import xong: ${ok} dòng OK, ${failed} lỗi`);
      } else {
        toast.success(`Import xong: ${ok} dòng OK`);
      }

      setExcelFile(null);
      setPage(1);
      void loadBatches(1);
    } catch {
      toast.error("Import thất bại");
    } finally {
      setImporting(false);
    }
  }

  async function runInventoryImport() {
    if (!inventoryFile) {
      toast.error("Vui lòng chọn file Excel.");
      return;
    }
    if (!inventoryPackageId || !inventorySupplierId) {
      toast.error("Vui lòng chọn gói cước và nhà cung cấp.");
      return;
    }

    setInventoryImporting(true);
    try {
      const fd = new FormData();
      fd.set("file", inventoryFile);
      fd.set("simType", simType);
      fd.set("packageId", inventoryPackageId);
      fd.set("supplierId", inventorySupplierId);

      const res = await fetch("/api/admin/import/sim-inventory", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { successRows?: number; failedRows?: number };
        message?: string;
      };

      if (!res.ok) {
        toast.error(json.message || "Import thất bại");
        return;
      }

      const ok = json.data?.successRows ?? 0;
      const failed = json.data?.failedRows ?? 0;
      toast.success(
        failed > 0 ? `Import kho: ${ok} dòng OK, ${failed} lỗi` : `Import kho: ${ok} dòng OK`
      );

      setInventoryFile(null);
      setPage(1);
      void loadBatches(1);
    } catch {
      toast.error("Import kho thất bại");
    } finally {
      setInventoryImporting(false);
    }
  }

  const canPkgImport =
    Boolean(pkgSupplierId) && !suppliersLoading && !pkgImporting;
  const canImport = Boolean(supplierId) && !suppliersLoading && !importing;
  const canInventoryImport =
    Boolean(inventoryPackageId && inventorySupplierId) &&
    !suppliersLoading &&
    !inventoryImporting;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Import dữ liệu</h1>
        <p className="mt-1 text-sm text-slate-600">
          Import gói cước NCC, giá vốn và kho SIM/eSIM từ file Excel.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Import gói cước NCC (Excel)</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tạo/cập nhật gói cước, giá bán và giá vốn theo mã gói NCC. Cột:{" "}
              {SUPPLIER_PACKAGES_IMPORT_HEADERS.join(" · ")}
            </p>
          </div>
          <ImportTemplateDownloadButton
            templateType={simTypeToSupplierPackagesTemplate(pkgSimType)}
            label={
              pkgSimType === "physical_sim" ? "Tải mẫu SIM vật lý" : "Tải mẫu eSIM"
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-700">
              Loại SIM <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={pkgSimType}
              disabled={pkgImporting}
              onChange={(e) => setPkgSimType(e.target.value as "esim" | "physical_sim")}
            >
              <option value="esim">eSIM</option>
              <option value="physical_sim">SIM vật lý</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-700">
              Nhà cung cấp <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={pkgSupplierId}
              disabled={suppliersLoading || pkgImporting}
              onChange={(e) => setPkgSupplierId(e.target.value)}
            >
              {suppliers.length === 0 ? (
                <option value="">
                  {suppliersLoading ? "Đang tải…" : "Chưa có NCC — tạo ở Admin trước"}
                </option>
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

        <ul className="list-inside list-disc space-y-1 text-xs text-slate-500">
          <li>
            <strong>Quốc gia:</strong> mã (JP, KR), slug hoặc tên — nhiều quốc gia cách bởi dấu phẩy.
          </li>
          <li>
            <strong>Mã gói cước:</strong> gói chưa có sẽ được tạo mới; gói đã có sẽ cập nhật giá và thông tin.
          </li>
          <li>
            <strong>Loại gói cước:</strong> data_only, data_call, unlimited, daily_data.
          </li>
          <li>Dùng sheet đầu tiên, dòng 1 là header — không đổi tên cột trong file mẫu.</li>
        </ul>

        <ExcelFilePicker
          id="supplier-packages-file"
          file={pkgFile}
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={pkgImporting || suppliersLoading || (!pkgSupplierId && !pkgFile)}
          onChange={setPkgFile}
          label="File Excel *"
          buttonLabel="Chọn file Excel"
          hint="Chỉ chấp nhận .xlsx"
          removeLabel="Xóa file"
        />

        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={!canPkgImport || !pkgFile}
          onClick={() => void runSupplierPackagesImport()}
        >
          {pkgImporting ? "Đang import…" : "Import gói cước NCC"}
        </button>

        {pkgResult ? (
          <ImportBatchResultCard result={pkgResult} onDismiss={() => setPkgResult(null)} />
        ) : null}
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Import giá nhà cung cấp (Excel)</h2>
            <p className="mt-1 text-xs text-slate-500">
              Cột gợi ý: {SUPPLIER_PRICE_COLUMNS.join(" · ")}
            </p>
          </div>
          <ImportTemplateDownloadButton templateType="supplier-prices" />
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">
            Nhà cung cấp <span className="text-red-500">*</span>
          </span>
          <select
            className={inputClass}
            value={supplierId}
            disabled={suppliersLoading || importing}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            {suppliers.length === 0 ? (
              <option value="">
                {suppliersLoading ? "Đang tải…" : "Chưa có NCC — tạo ở Admin trước"}
              </option>
            ) : (
              suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">
            packageId mặc định
            <span className="ml-1 font-normal text-slate-500">(tùy chọn)</span>
          </span>
          <input
            className={inputClass}
            placeholder="665a1b2c3d4e5f6789012345"
            value={packageId}
            disabled={importing}
            onChange={(e) => setPackageId(e.target.value)}
          />
        </label>

        <ExcelFilePicker
          file={excelFile}
          disabled={importing || suppliersLoading || (!supplierId && !excelFile)}
          onChange={setExcelFile}
          label="File Excel *"
          buttonLabel="Chọn file Excel"
          hint="Kéo thả hoặc bấm để chọn (.xlsx, .xls)"
          removeLabel="Xóa file"
        />

        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={!canImport || !excelFile}
          onClick={() => void runImport()}
        >
          {importing ? "Đang import…" : "Import Excel"}
        </button>
      </div>
{/* 
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Import kho SIM/eSIM (Excel)</h2>
            <p className="mt-1 text-xs text-slate-500">
              Cột eSIM: {SIM_INVENTORY_ESIM_COLUMNS.join(" · ")} · Cột SIM vật lý:{" "}
              {SIM_INVENTORY_PHYSICAL_COLUMNS.join(" · ")}
            </p>
          </div>
          <ImportTemplateDownloadButton templateType={simTypeToImportTemplate(simType)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-700">Loại SIM</span>
            <select
              className={inputClass}
              value={simType}
              disabled={inventoryImporting}
              onChange={(e) => setSimType(e.target.value as "esim" | "physical_sim")}
            >
              <option value="esim">eSIM</option>
              <option value="physical_sim">SIM vật lý</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-700">Gói cước</span>
            <select
              className={inputClass}
              value={inventoryPackageId}
              disabled={inventoryImporting || packageOptions.length === 0}
              onChange={(e) => setInventoryPackageId(e.target.value)}
            >
              {packageOptions.length === 0 ? (
                <option value="">Chưa có gói</option>
              ) : (
                packageOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">Nhà cung cấp</span>
            <select
              className={inputClass}
              value={inventorySupplierId}
              disabled={inventoryImporting || suppliersLoading}
              onChange={(e) => setInventorySupplierId(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        <ExcelFilePicker
          file={inventoryFile}
          disabled={!canInventoryImport && !inventoryFile}
          onChange={setInventoryFile}
          label="File Excel kho *"
          buttonLabel="Chọn file Excel"
          hint="Kéo thả hoặc bấm để chọn (.xlsx, .xls)"
          removeLabel="Xóa file"
        />

        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={!canInventoryImport || !inventoryFile}
          onClick={() => void runInventoryImport()}
        >
          {inventoryImporting ? "Đang import…" : "Import kho SIM/eSIM"}
        </button>
      </div> */}

      <div className={`card ${adminTableWrapClass} p-4`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Lịch sử import</h2>
          <select
            className="rounded-lg border px-2 py-1 text-sm"
            value={batchType}
            onChange={(e) => {
              setBatchType(e.target.value as BatchTypeFilter);
              setPage(1);
              setDetailBatch(null);
            }}
          >
            <option value="">Tất cả loại</option>
            <option value="supplier_packages">Gói cước NCC</option>
            <option value="supplier_price">Giá NCC</option>
            <option value="sim_inventory">Kho SIM/eSIM</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Thời gian</th>
                <th>File</th>
                <th>Loại</th>
                <th>Loại SIM</th>
                <th>NCC</th>
                <th>OK</th>
                <th>Lỗi</th>
                <th>Trạng thái</th>
                <th>Người upload</th>
              </tr>
            </thead>
            <tbody>
              {list.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500">
                    Chưa có lịch sử import.
                  </td>
                </tr>
              ) : (
                list.items.map((b) => {
                  const failed = Number(b.failedRows ?? 0);
                  const rowId = docId(b);
                  const detailId = detailBatch
                    ? String(detailBatch._id || detailBatch.id || "")
                    : "";
                  const isSelected = Boolean(detailId && detailId === rowId);
                  return (
                    <tr
                      key={rowId}
                      className={`border-t ${failed > 0 ? "cursor-pointer hover:bg-slate-50" : ""} ${
                        isSelected ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => {
                        if (failed <= 0) return;
                        setDetailBatch(b as unknown as ImportBatch);
                      }}
                    >
                      <td className="whitespace-nowrap py-2 text-xs text-slate-600">
                        {formatBatchTime(b.createdAt)}
                      </td>
                      <td className="max-w-[160px] truncate" title={String(b.fileName)}>
                        {String(b.fileName)}
                      </td>
                      <td>{BATCH_TYPE_LABEL[String(b.type)] || String(b.type)}</td>
                      <td>
                        {b.simType ? formatSimType(String(b.simType)) : "—"}
                      </td>
                      <td className="max-w-[120px] truncate" title={supplierLabel(b.supplierId, suppliers)}>
                        {supplierLabel(b.supplierId, suppliers)}
                      </td>
                      <td className="font-semibold text-emerald-700">{String(b.successRows ?? 0)}</td>
                      <td className={failed > 0 ? "font-semibold text-red-600" : ""}>
                        {String(b.failedRows ?? 0)}
                      </td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${batchStatusBadgeClass(b)}`}
                        >
                          {batchStatusLabel(b)}
                        </span>
                      </td>
                      <td className="max-w-[120px] truncate" title={formatUploadedBy(b.uploadedBy)}>
                        {formatUploadedBy(b.uploadedBy)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {detailBatch && (detailBatch.errors?.length ?? 0) > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Chi tiết lỗi — {detailBatch.fileName}
            </p>
            <ImportBatchResultCard result={detailBatch} onDismiss={() => setDetailBatch(null)} />
          </div>
        ) : null}
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

export default function AdminImportPage() {
  return (
    <AdminOnlyGate>
      <AdminImportContent />
    </AdminOnlyGate>
  );
}
