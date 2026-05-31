"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatOrderStatus, formatSimType, formatVnd } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function DonHangPage() {
  const params = useParams<{ code: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [proof, setProof] = useState("");

  useEffect(() => {
    void fetch(`/api/orders/${params.code}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.data);
        setBankAccount(d.settings?.bankAccount || "");
      });
  }, [params.code]);

  async function submitPayment() {
    if (!order || !proof.trim()) {
      toast.error("Nhập mã giao dịch / ghi chú chuyển khoản");
      return;
    }
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentProof: proof }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Gửi thất bại");
      return;
    }
    setOrder(data.data);
    toast.success("Đã gửi xác nhận thanh toán. Chờ nhân viên duyệt.");
  }

  function printBill() {
    window.print();
  }

  if (!order) {
    return <div className="container-page py-10">Đang tải bill…</div>;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-black">Bill đơn hàng</h1>
          <p className="text-slate-600">Mã đơn: {order.code}</p>
        </div>
        <button type="button" className="btn-primary" onClick={printBill}>
          In / Xuất bill
        </button>
      </div>

      <div id="bill" className="card p-6">
        <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
          <div>
            <div className="text-xl font-black text-[#1d6be8]">Mifigo SIM</div>
            <div className="text-sm text-slate-600">Bill bán hàng gói cước du lịch</div>
          </div>
          <div className="text-right text-sm">
            <div>Mã: <strong>{order.code}</strong></div>
            <div>Trạng thái: {formatOrderStatus(order.status)}</div>
            <div>{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div><strong>Khách:</strong> {order.customerName}</div>
          <div><strong>SĐT:</strong> {order.customerPhone}</div>
          <div><strong>Email:</strong> {order.customerEmail}</div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Gói cước</th>
              <th>Loại</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th className="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.packageId} className="border-b">
                <td className="py-3">{item.packageName}</td>
                <td>{formatSimType(item.simType)}</td>
                <td>{item.quantity}</td>
                <td>{formatVnd(item.unitPrice)}</td>
                <td className="text-right font-semibold">{formatVnd(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right text-xl font-black text-[#1d6be8]">
          Tổng: {formatVnd(order.total)}
        </div>

        {bankAccount && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm whitespace-pre-line text-red-900">
            <strong>Thông tin chuyển khoản:</strong>
            {"\n"}
            {bankAccount.replace("[Mã đơn]", order.code)}
          </div>
        )}
      </div>

      {order.status === "pending_payment" && (
        <div className="card mt-6 p-5 print:hidden">
          <h2 className="font-bold">Xác nhận đã chuyển khoản</h2>
          <input
            className="mt-3 w-full rounded-xl border px-3 py-2.5 text-sm"
            placeholder="Mã giao dịch / ghi chú chuyển khoản"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
          />
          <button type="button" className="btn-primary mt-3" onClick={() => void submitPayment()}>
            Gửi xác nhận thanh toán
          </button>
        </div>
      )}
    </div>
  );
}
