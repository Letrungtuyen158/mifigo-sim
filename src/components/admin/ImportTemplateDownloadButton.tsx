"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  downloadImportTemplate,
  IMPORT_TEMPLATE_LABELS,
  type ImportTemplateType,
} from "@/lib/admin-import-templates";

const TEMPLATE_ACCENT: Record<
  ImportTemplateType,
  { iconBg: string; iconColor: string; ring: string; hover: string }
> = {
  "supplier-packages-esim": {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-200/80",
    hover: "hover:border-emerald-300 hover:bg-emerald-50/60",
  },
  "supplier-packages-physical-sim": {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    ring: "ring-violet-200/80",
    hover: "hover:border-violet-300 hover:bg-violet-50/60",
  },
  "supplier-prices": {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    ring: "ring-amber-200/80",
    hover: "hover:border-amber-300 hover:bg-amber-50/60",
  },
  "sim-inventory-esim": {
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    ring: "ring-sky-200/80",
    hover: "hover:border-sky-300 hover:bg-sky-50/60",
  },
  "sim-inventory-physical-sim": {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    ring: "ring-orange-200/80",
    hover: "hover:border-orange-300 hover:bg-orange-50/60",
  },
};

function TemplateDownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2" />
      <path d="M8 17h2" />
      <path d="M14 13h2" />
      <path d="M14 17h2" />
      <path d="M12 18v-6" />
      <path d="m9 15 3 3 3-3" />
    </svg>
  );
}

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
  const accent = TEMPLATE_ACCENT[templateType];

  return (
    <button
      type="button"
      disabled={loading}
      className={
        className ||
        `inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ${accent.ring} ${accent.hover} disabled:opacity-60`
      }
      onClick={() => {
        setLoading(true);
        try {
          downloadImportTemplate(templateType);
          toast.success(`Đã tải ${IMPORT_TEMPLATE_LABELS[templateType]}`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Tải file mẫu thất bại");
        } finally {
          setLoading(false);
        }
      }}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accent.iconBg} ${accent.iconColor}`}
      >
        <TemplateDownloadIcon />
      </span>
      <span>{loading ? "Đang tải…" : text}</span>
    </button>
  );
}
