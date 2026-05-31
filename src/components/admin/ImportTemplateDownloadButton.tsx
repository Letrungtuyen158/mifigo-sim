"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  downloadImportTemplate,
  IMPORT_TEMPLATE_LABELS,
  type ImportTemplateType,
} from "@/lib/admin-import-templates";

export default function ImportTemplateDownloadButton({
  templateType,
  label,
  className = "",
}: {
  templateType: ImportTemplateType;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const text = label || `Tải mẫu ${IMPORT_TEMPLATE_LABELS[templateType]}`;

  return (
    <button
      type="button"
      disabled={loading}
      className={
        className ||
        "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      }
      onClick={() => {
        setLoading(true);
        void downloadImportTemplate(templateType)
          .then(() => toast.success(`Đã tải ${IMPORT_TEMPLATE_LABELS[templateType]}`))
          .catch((e) =>
            toast.error(e instanceof Error ? e.message : "Tải file mẫu thất bại")
          )
          .finally(() => setLoading(false));
      }}
    >
      {loading ? "Đang tải…" : text}
    </button>
  );
}
