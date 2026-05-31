"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { mapOrderFromApi, mapOrderStatusToApi } from "@/lib/api/mappers";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { inputClass, adminBreakTextClass } from "@/lib/admin-utils";
import { formatOrderStatus, formatVnd } from "@/lib/format";
import {
  ORDER_ACTION_ACTIVE,
  ORDER_ACTION_IDLE,
  ORDER_STATUS_ACTIONS,
  isOrderActionActive,
} from "@/lib/order-status-ui";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_FILTER_VALUES: (OrderStatus | "")[] = [
  "",
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "completed",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<OrderStatus | "">("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<OrderStatus | "">("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });

  const load = useCallback(
    async (p = page) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedSearch) extra.search = appliedSearch;
        if (appliedStatus) extra.status = mapOrderStatusToApi(appliedStatus);

        const data = await fetchAdminPaginated<Record<string, unknown>>(
          "/api/admin/orders",
          p,
          ADMIN_LIST_LIMIT,
          extra
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
    },
    [page, appliedSearch, appliedStatus]
  );

  useEffect(() => {
    void load(page);
  }, [page, appliedSearch, appliedStatus, load]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedStatus(statusInput);
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setStatusInput("");
    setAppliedSearch("");
    setAppliedStatus("");
    setPage(1);
  }

  async function issueInvoice(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/invoice`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Xuất hóa đơn thất bại");
    toast.success(`Hóa đơn: ${data.data?.invoiceCode || "OK"}`);
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
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

  const hasActiveFilters = Boolean(appliedSearch || appliedStatus);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Đơn hàng</h1>
        <p className="text-sm text-slate-600">
          Duyệt chuyển khoản thủ công, xuất bill cho khách.
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="min-w-0 flex-1 sm:min-w-[220px]">
          <span className="mb-1 block text-xs font-bold text-slate-600">Mã đơn</span>
          <input
            type="search"
            className={inputClass}
            placeholder="ORD-BULK-0046…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="w-full sm:w-52">
          <span className="mb-1 block text-xs font-bold text-slate-600">Trạng thái</span>
          <select
            className={inputClass}
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as OrderStatus | "")}
          >
            {STATUS_FILTER_VALUES.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? formatOrderStatus(value) : "Tất cả trạng thái"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2 text-sm">
            Lọc
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={resetFilters}
            >
              Xóa lọc
            </button>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Chú thích:</span>
        <OrderStatusBadge status="pending_payment" />
        <OrderStatusBadge status="payment_review" />
        <OrderStatusBadge status="paid" />
        <OrderStatusBadge status="completed" />
        <OrderStatusBadge status="cancelled" />
      </div>

      {hasActiveFilters ? (
        <p className="text-sm text-slate-600">
          {meta.total} đơn phù hợp
          {appliedSearch ? ` · mã "${appliedSearch}"` : ""}
          {appliedStatus ? ` · ${formatOrderStatus(appliedStatus)}` : ""}
        </p>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-bold">{order.code}</div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className={`mt-1 text-sm text-slate-600 ${adminBreakTextClass}`}>
                  {order.customerName} · {order.customerPhone} · {order.customerEmail}
                </div>
                {order.paymentProof && (
                  <div className="mt-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-900">
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
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#1d6be8] hover:underline"
                >
                  Mở bill
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                className="rounded-full border border-[#1d6be8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d6be8] transition hover:bg-blue-50"
                onClick={() => void issueInvoice(order.id)}
              >
                Xuất hóa đơn
              </button>
              {ORDER_STATUS_ACTIONS.map((action) => {
                const active = isOrderActionActive(order.status, action);
                return (
                  <button
                    key={action.key}
                    type="button"
                    disabled={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? ORDER_ACTION_ACTIVE[action.key]
                        : ORDER_ACTION_IDLE
                    } ${active ? "cursor-default" : ""}`}
                    onClick={() => void updateStatus(order.id, action.key)}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="card p-6 text-slate-500">
            {hasActiveFilters ? "Không có đơn phù hợp bộ lọc." : "Chưa có đơn hàng."}
          </div>
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
