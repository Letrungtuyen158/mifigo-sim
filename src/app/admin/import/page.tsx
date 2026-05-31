"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminOnlyGate from "@/components/admin/AdminOnlyGate";
import AdminPagination from "@/components/admin/AdminPagination";
import ExcelFilePicker from "@/components/admin/ExcelFilePicker";
import ImportTemplateDownloadButton from "@/components/admin/ImportTemplateDownloadButton";
import { simTypeToImportTemplate } from "@/lib/admin-import-templates";
import { fetchAdminSuppliers, fetchPackageSelectOptions } from "@/lib/admin-pricing";
import { docId, inputClass, adminTableWrapClass } from "@/lib/admin-utils";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminPaginated,
  type AdminPaginated,
} from "@/lib/admin-list";
import type { Supplier } from "@/lib/types";

const BATCH_TYPE_LABEL: Record<string, string> = {
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
  "cost_price",
  "supplier_package_code",
  "supplier_package_name",
  "available_quantity",
];

const SIM_INVENTORY_ESIM_COLUMNS = [
  "iccid",
  "esim_code",
  "qr_code_url",
  "activation_code",
  "smdp_address",
  "note",
];

const SIM_INVENTORY_PHYSICAL_COLUMNS = ["iccid", "serial_number", "note"];

function AdminImportContent() {
  const [batchType, setBatchType] = useState<"" | "supplier_price" | "sim_inventory">("");
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
          setSupplierId(data[0].id);
          setInventorySupplierId(data[0].id);
        }
        if (pkgOpts[0]) setInventoryPackageId(pkgOpts[0].id);
      })
      .catch(() => toast.error("Lỗi tải NCC"))
      .finally(() => setSuppliersLoading(false));
  }, []);

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
          Import bảng giá nhà cung cấp từ file Excel (.xlsx, .xls).
        </p>
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
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Lịch sử import</h2>
          <select
            className="rounded-lg border px-2 py-1 text-sm"
            value={batchType}
            onChange={(e) => {
              setBatchType(e.target.value as "" | "supplier_price" | "sim_inventory");
              setPage(1);
            }}
          >
            <option value="">Tất cả loại</option>
            <option value="supplier_price">Giá NCC</option>
            <option value="sim_inventory">Kho SIM/eSIM</option>
          </select>
        </div>
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
            {list.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Chưa có lịch sử import.
                </td>
              </tr>
            ) : (
              list.items.map((b) => {
                const status = String(b.status || "");
                return (
                  <tr key={docId(b)} className="border-t">
                    <td className="max-w-[200px] truncate py-2" title={String(b.fileName)}>
                      {String(b.fileName)}
                    </td>
                    <td>{BATCH_TYPE_LABEL[String(b.type)] || String(b.type)}</td>
                    <td className="font-semibold text-emerald-700">{String(b.successRows ?? 0)}</td>
                    <td className={Number(b.failedRows) > 0 ? "font-semibold text-red-600" : ""}>
                      {String(b.failedRows ?? 0)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          BATCH_STATUS_CLASS[status] ??
                          "bg-slate-100 text-slate-700 ring-slate-200/80"
                        }`}
                      >
                        {BATCH_STATUS_LABEL[status] || status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
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

export default function AdminImportPage() {
  return (
    <AdminOnlyGate>
      <AdminImportContent />
    </AdminOnlyGate>
  );
}
