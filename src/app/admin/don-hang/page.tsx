"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatOrderStatus, formatVnd } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const res = await fetch("/api/admin/store");
    const data = await res.json();
    setOrders(data.data.orders || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (!res.ok) {
      toast.error("Cập nhật thất bại");
      return;
    }
    toast.success("Đã cập nhật đơn");
    void load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Đơn hàng</h1>
        <p className="text-sm text-slate-600">Duyệt chuyển khoản thủ công, xuất bill cho khách.</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-bold">{order.code}</div>
                <div className="text-sm text-slate-600">
                  {order.customerName} · {order.customerPhone} · {order.customerEmail}
                </div>
                <div className="mt-1 text-sm">{formatOrderStatus(order.status)}</div>
                {order.paymentProof && (
                  <div className="mt-1 text-xs text-slate-500">
                    Xác nhận CK: {order.paymentProof}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[#1d6be8]">
                  {formatVnd(order.total)}
                </div>
                <a
                  href={`/don-hang/${order.code}`}
                  target="_blank"
                  className="text-sm font-semibold text-[#1d6be8]"
                >
                  Mở bill
                </a>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["payment_review", "Chờ duyệt CK"],
                ["paid", "Đã thanh toán"],
                ["completed", "Hoàn tất"],
                ["cancelled", "Hủy"],
              ].map(([status, label]) => (
                <button
                  key={status}
                  type="button"
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  onClick={() => void updateStatus(order.id, status)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="card p-6 text-slate-500">Chưa có đơn hàng.</div>
        )}
      </div>
    </div>
  );
}
