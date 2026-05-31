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
  accept = ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
  disabled = false,
  file,
  onChange,
  label = "Chọn file Excel",
  hint = "Kéo thả hoặc bấm để chọn file .xlsx / .xls",
  buttonLabel = "Chọn file Excel",
  removeLabel = "Xóa file",
  id = "excel-file-picker",
}: {
  accept?: string;
  disabled?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
  buttonLabel?: string;
  removeLabel?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function pickFile(selected: File | undefined) {
    if (!selected || disabled) return;
    onChange(selected);
  }

  function clearFile() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {label ? (
        <span id={`${id}-label`} className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        aria-labelledby={label ? `${id}-label` : undefined}
        onChange={(e) => pickFile(e.target.files?.[0])}
      />

      {!file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (disabled) return;
            pickFile(e.dataTransfer.files?.[0]);
          }}
          className={`group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            disabled
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
            <UploadIcon />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1d6be8]">{buttonLabel}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </div>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <FileSpreadsheetIcon className="h-5 w-5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {(file.size / 1024).toFixed(0)} KB
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-[#1d6be8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1558c0]"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {buttonLabel}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              disabled={disabled}
              onClick={clearFile}
            >
              {removeLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
