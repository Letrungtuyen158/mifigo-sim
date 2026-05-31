"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminEsimVnPage() {
  const [importing, setImporting] = useState(false);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/esim-vn", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import thất bại");
      toast.success(`Đã import ${data.imported} eSIM`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import lỗi");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Import eSIM Việt Nam</h1>
        <p className="text-sm text-slate-600">
          Upload file Excel/CSV. Cột gợi ý: ICCID, Phone, Serial, QR, Activation Code, Plan, Notes.
        </p>
      </div>

      <div className="card p-5">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          disabled={importing}
          onChange={(e) => void handleImport(e)}
        />
        <p className="mt-3 text-xs text-slate-500">
          Khách chỉ xuất được sau khi thanh toán được duyệt (paid/completed).
        </p>
      </div>
    </div>
  );
}
