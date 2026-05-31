"use client";

import { useRef, useState } from "react";

function UploadIcon({ className = "h-6 w-6" }: { className?: string }) {
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
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14a2 2 0 0 0 2-2v-4H3v4a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function FileSpreadsheetIcon({ className = "h-5 w-5" }: { className?: string }) {
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
    </svg>
  );
}

export default function ExcelFilePicker({
  accept = ".xlsx,.xls",
  disabled = false,
  loading = false,
  label = "Chọn file Excel",
  hint = "Kéo thả hoặc bấm để chọn (.xlsx, .xls)",
  onFileSelect,
}: {
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  hint?: string;
  onFileSelect: (file: File) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file || disabled || loading) return;
    setFileName(file.name);
    await onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || loading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || loading) return;
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          disabled || loading
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : dragOver
              ? "border-[#1d6be8] bg-blue-50"
              : "border-slate-200 bg-slate-50/80 hover:border-[#1d6be8] hover:bg-blue-50/60"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
            dragOver
              ? "bg-[#1d6be8] text-white"
              : "bg-white text-[#1d6be8] shadow-sm ring-1 ring-slate-200 group-hover:bg-[#1d6be8] group-hover:text-white"
          }`}
        >
          {loading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <UploadIcon />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {loading ? "Đang import…" : label}
          </p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        {fileName && !loading ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <FileSpreadsheetIcon className="h-4 w-4" />
            {fileName}
          </span>
        ) : null}
      </button>
    </div>
  );
}
