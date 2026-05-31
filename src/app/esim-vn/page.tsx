"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface VnEsimRow {
  id: string;
  iccid?: string;
  phoneNumber?: string;
  serial?: string;
  planName?: string;
  status: string;
  qrPayload?: string;
  activationCode?: string;
  canExport?: boolean;
}

export default function EsimVnPage() {
  const [items, setItems] = useState<VnEsimRow[]>([]);
  const [role, setRole] = useState("guest");

  useEffect(() => {
    void Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/esim-vn").then((r) => r.json()),
    ]).then(([me, esim]) => {
      setRole(me.role || "guest");
      setItems(esim.data || []);
    });
  }, []);

  function exportCsv() {
    const exportable = items.filter((i) => i.canExport || role === "admin");
    if (exportable.length === 0) {
      toast.error("Chưa có eSIM được phép xuất (cần thanh toán & duyệt).");
      return;
    }
    const header = ["ICCID", "Phone", "Serial", "Plan", "QR", "ActivationCode", "Status"];
    const rows = exportable.map((i) =>
      [
        i.iccid || "",
        i.phoneNumber || "",
        i.serial || "",
        i.planName || "",
        i.qrPayload || "",
        i.activationCode || "",
        i.status,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "esim-vn-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">eSIM Việt Nam</h1>
          <p className="mt-2 text-slate-600">
            Khách xuất eSIM sau khi thanh toán được duyệt. Admin nhập từ Excel.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={exportCsv}>
          Xuất CSV
        </button>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">ICCID / SĐT</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">QR / Mã KH</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.phoneNumber || "—"}</div>
                  <div className="text-xs text-slate-500">{item.iccid}</div>
                </td>
                <td className="px-4 py-3">{item.planName || "—"}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3 text-xs">
                  {item.canExport || role === "admin" ? (
                    <>
                      <div>{item.qrPayload || "—"}</div>
                      <div className="text-slate-500">{item.activationCode}</div>
                    </>
                  ) : (
                    <span className="text-amber-700">Thanh toán & duyệt để xem</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 bg-blue-50 p-5 text-sm text-blue-900">
        <strong>Lưu ý thanh toán doanh nghiệp:</strong> Giai đoạn này dùng chuyển khoản thủ công +
        duyệt bill. Kết nối cổng ngân hàng (VietQR/API) có thể bổ sung ở phase sau.
      </div>
    </div>
  );
}
