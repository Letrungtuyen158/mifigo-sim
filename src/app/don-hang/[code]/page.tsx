"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { tOrderStatus, tSimType } from "@/lib/i18n";
import { formatVnd } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function DonHangPage() {
  const params = useParams<{ code: string }>();
  const { t, locale } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch(`/api/orders/${params.code}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.data);
        setBankAccount(d.settings?.bankAccount || "");
      });
  }, [params.code]);

  async function submitPayment() {
    if (!order) return;
    if (!proofFile) {
      toast.error(t("order.proofImageRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("proofImage", proofFile, proofFile.name);
      if (transactionCode.trim()) {
        formData.set("transactionCode", transactionCode.trim());
      }

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || t("order.submitProof"));
        return;
      }
      setOrder(data.data);
      setProofFile(null);
      setTransactionCode("");
      toast.success(t("order.proofSent"));
    } catch {
      toast.error(t("order.submitProof"));
    } finally {
      setSubmitting(false);
    }
  }

  function printBill() {
    window.print();
  }

  if (!order) {
    return <div className="container-page py-10">{t("order.loading")}</div>;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-black">{t("order.billTitle")}</h1>
          <p className="text-slate-600">
            {t("order.orderCode")}: {order.code}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={printBill}>
          {t("order.print")}
        </button>
      </div>

      <div id="bill" className="card p-6">
        <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
          <div>
            <div className="text-xl font-black text-[#1d6be8]">Mifigo SIM</div>
            <div className="text-sm text-slate-600">{t("order.salesBill")}</div>
          </div>
          <div className="text-right text-sm">
            <div>
              {t("order.orderCode")}: <strong>{order.code}</strong>
            </div>
            <div>
              {t("order.status")}: {tOrderStatus(locale, order.status)}
            </div>
            <div>
              {new Date(order.createdAt).toLocaleString(
                locale === "vi" ? "vi-VN" : locale === "zh" ? "zh-CN" : "en-US"
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <strong>{t("order.customer")}:</strong> {order.customerName}
          </div>
          <div>
            <strong>{t("order.phone")}:</strong> {order.customerPhone}
          </div>
          <div>
            <strong>Email:</strong> {order.customerEmail}
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">{t("order.package")}</th>
              <th>{t("order.type")}</th>
              <th>{t("order.qty")}</th>
              <th>{t("order.unitPrice")}</th>
              <th className="text-right">{t("order.lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.packageId} className="border-b">
                <td className="py-3">{item.packageName}</td>
                <td>{tSimType(locale, item.simType)}</td>
                <td>{item.quantity}</td>
                <td>{formatVnd(item.unitPrice)}</td>
                <td className="text-right font-semibold">{formatVnd(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right text-xl font-black text-[#1d6be8]">
          {t("order.total")}: {formatVnd(order.total)}
        </div>

        {bankAccount && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm whitespace-pre-line text-red-900">
            <strong>{t("order.bankInfo")}</strong>
            {"\n"}
            {bankAccount.replace("[Mã đơn]", order.code)}
          </div>
        )}
      </div>

      {order.status === "pending_payment" && (
        <div className="card mt-6 p-5 print:hidden">
          <h2 className="font-bold">{t("order.confirmPayment")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("order.proofHint")}</p>

          <label className="mt-4 block text-sm font-semibold">
            {t("order.proofImage")} *
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 w-full text-sm"
              disabled={submitting}
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <label className="mt-3 block text-sm font-semibold">
            {t("order.transactionNote")}
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal"
              placeholder={t("order.transactionNoteOptional")}
              value={transactionCode}
              disabled={submitting}
              onChange={(e) => setTransactionCode(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="btn-primary mt-4"
            disabled={submitting}
            onClick={() => void submitPayment()}
          >
            {submitting ? t("order.submittingProof") : t("order.submitProof")}
          </button>
        </div>
      )}
    </div>
  );
}
