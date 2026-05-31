"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { useTranslation } from "@/contexts/LanguageContext";
import { ADMIN_LIST_LIMIT } from "@/lib/admin-list";

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
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });

  const load = useCallback(async (p: number) => {
    const [me, esim] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/esim-vn?page=${p}&limit=${ADMIN_LIST_LIMIT}`).then((r) => r.json()),
    ]);
    setRole(me.role || "guest");
    setItems(esim.data || []);
    if (me.role === "admin" && esim.totalPages !== undefined) {
      setMeta({
        total: esim.total ?? 0,
        totalPages: esim.totalPages ?? 1,
        limit: esim.pageSize ?? ADMIN_LIST_LIMIT,
        page: esim.page ?? p,
      });
      setPage(esim.page ?? p);
    }
  }, []);

  useEffect(() => {
    void load(page).catch(() => toast.error(t("common.loading")));
  }, [page, load, t]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-3xl">{t("esimVn.title")}</h1>
          <p className="mt-2 text-slate-600">{t("esimVn.subtitle")}</p>
        </div>
        {role === "admin" ? (
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={exportCsv}>
            {t("esimVn.exportCsv")}
          </button>
        ) : null}
      </div>

      <div className={`card mt-6 admin-table-scroll p-0 sm:p-0`}>
        <div className="overflow-x-auto p-4">
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
                    <div className="break-all text-xs text-slate-500">{item.iccid}</div>
                  </td>
                  <td className="px-4 py-3">{item.planName || "—"}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs break-all">
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
        {role === "admin" ? (
          <div className="px-4 pb-4">
            <AdminPagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>

      <div className="card mt-6 bg-blue-50 p-5 text-sm text-blue-900">
        <strong>{t("esimVn.note")}</strong>
      </div>
    </div>
  );
}
