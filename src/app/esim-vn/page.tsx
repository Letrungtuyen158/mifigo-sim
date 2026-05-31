"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/contexts/LanguageContext";

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
  const { t } = useTranslation();
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
      toast.error(t("esimVn.exportEmpty"));
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
          <h1 className="text-3xl font-black">{t("esimVn.title")}</h1>
          <p className="mt-2 text-slate-600">{t("esimVn.subtitle")}</p>
        </div>
        <button type="button" className="btn-primary" onClick={exportCsv}>
          {t("esimVn.exportCsv")}
        </button>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("esimVn.iccid")}</th>
              <th className="px-4 py-3">{t("esimVn.plan")}</th>
              <th className="px-4 py-3">{t("esimVn.status")}</th>
              <th className="px-4 py-3">{t("esimVn.qr")}</th>
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
                    <span className="text-amber-700">{t("esimVn.payToView")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 bg-blue-50 p-5 text-sm text-blue-900">
        <strong>{t("esimVn.note")}</strong>
      </div>
    </div>
  );
}
