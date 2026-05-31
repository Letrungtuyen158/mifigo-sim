"use client";

import type { SelectOption } from "@/lib/admin-selects";
import { inputClass } from "@/lib/admin-utils";

export default function CountryMultiSelect({
  options,
  value,
  onChange,
  className = "",
}: {
  options: SelectOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  if (options.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có quốc gia — tạo tại mục Quốc gia trước.</p>;
  }

  return (
    <div className={`max-h-44 overflow-y-auto rounded-lg border border-slate-200 p-2 ${className}`}>
      {options.map((c) => (
        <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-slate-50">
          <input
            type="checkbox"
            className={inputClass.replace("w-full", "w-auto")}
            checked={value.includes(c.id)}
            onChange={() => toggle(c.id)}
          />
          <span>{c.label}</span>
        </label>
      ))}
    </div>
  );
}
