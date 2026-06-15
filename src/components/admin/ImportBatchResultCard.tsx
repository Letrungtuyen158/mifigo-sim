"use client";

import type { ImportBatch } from "@/lib/import-types";
import { formatSimType } from "@/lib/format";

const STATUS_CLASS: Record<string, string> = {
  processing: "bg-amber-50 text-amber-800 ring-amber-200/80",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  failed: "bg-red-50 text-red-800 ring-red-200/80",
};

function statusBadgeClass(batch: ImportBatch) {
  const status = String(batch.status);
  if (status === "completed" && batch.failedRows > 0) {
    return "bg-amber-50 text-amber-900 ring-amber-200/80";
  }
  return STATUS_CLASS[status] ?? "bg-slate-100 text-slate-700 ring-slate-200/80";
}

function statusLabel(batch: ImportBatch) {
  const status = String(batch.status);
  if (status === "completed" && batch.failedRows > 0) return "Hoàn tất (có lỗi)";
  if (status === "completed") return "Hoàn tất";
  if (status === "failed") return "Thất bại";
  if (status === "processing") return "Đang xử lý";
  return status;
}

export default function ImportBatchResultCard({
  result,
  onDismiss,
}: {
  result: ImportBatch;
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">Kết quả import</p>
          <p className="mt-1 text-slate-600">{result.fileName}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${statusBadgeClass(result)}`}
        >
          {statusLabel(result)}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">Tổng dòng</dt>
          <dd className="font-semibold">{result.totalRows}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Thành công</dt>
          <dd className="font-semibold text-emerald-700">{result.successRows}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Thất bại</dt>
          <dd className={`font-semibold ${result.failedRows > 0 ? "text-red-600" : ""}`}>
            {result.failedRows}
          </dd>
        </div>
        {result.simType ? (
          <div>
            <dt className="text-xs text-slate-500">Loại SIM</dt>
            <dd className="font-semibold">{formatSimType(result.simType)}</dd>
          </div>
        ) : null}
      </dl>

      {result.errors?.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-md border border-red-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-red-50 text-left text-red-800">
              <tr>
                <th className="px-3 py-2">Dòng Excel</th>
                <th className="px-3 py-2">Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((err) => (
                <tr key={`${err.row}-${err.message}`} className="border-t border-red-50">
                  <td className="px-3 py-2 font-mono text-xs">{err.row}</td>
                  <td className="px-3 py-2 text-red-700">{err.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {onDismiss ? (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
          onClick={onDismiss}
        >
          Đóng kết quả
        </button>
      ) : null}
    </div>
  );
}
