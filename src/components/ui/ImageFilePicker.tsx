"use client";

import { useEffect, useRef, useState } from "react";

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

function ImageIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export default function ImageFilePicker({
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  file,
  onChange,
  label,
  hint,
  buttonLabel,
  removeLabel = "Remove",
  id = "image-file-picker",
}: {
  accept?: string;
  disabled?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  hint: string;
  buttonLabel: string;
  removeLabel?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(selected: File | undefined) {
    if (!selected || disabled) return;
    onChange(selected);
  }

  function clearFile() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-2">
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        onChange={(e) => pickFile(e.target.files?.[0])}
      />

      {!previewUrl ? (
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
          className={`group mt-2 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
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
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="max-h-40 w-full rounded-lg border border-white object-contain sm:max-w-[200px]"
            />
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{file?.name}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
