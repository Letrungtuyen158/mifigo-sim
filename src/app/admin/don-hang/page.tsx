"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { mapOrderFromApi } from "@/lib/api/mappers";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { formatOrderStatus, formatVnd } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });

  async function load(p = page) {
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/orders",
        p
      );
      setOrders(data.items.map((o) => mapOrderFromApi(o)));
      setMeta({
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
        page: data.page,
      });
      setPage(data.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải đơn");
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

  async function issueInvoice(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/invoice`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Xuất hóa đơn thất bại");
    toast.success(`Hóa đơn: ${data.data?.invoiceCode || "OK"}`);
  }

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
    void load(page);
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
              <button
                type="button"
                className="rounded-full border border-[#1d6be8] px-3 py-1 text-xs font-semibold text-[#1d6be8]"
                onClick={() => void issueInvoice(order.id)}
              >
                Xuất hóa đơn
              </button>
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

      <AdminPagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
