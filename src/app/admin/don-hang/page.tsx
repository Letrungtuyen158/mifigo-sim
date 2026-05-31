"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import PaymentStatusBadge from "@/components/admin/PaymentStatusBadge";
import { mapOrderDetailFromApi, mapOrderFromApi, mapOrderStatusToApi } from "@/lib/api/mappers";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { inputClass, adminBreakTextClass, adminTableWrapClass } from "@/lib/admin-utils";
import { formatOrderStatus, formatPaymentStatus, formatVnd } from "@/lib/format";
import {
  ADMIN_ORDER_QUEUES,
  ORDER_STATUS_FILTER_VALUES,
  PAYMENT_STATUS_FILTER_VALUES,
  canApprovePayment,
  canCancelOrder,
  canCompleteOrder,
  type AdminOrderQueue,
} from "@/lib/order-status-ui";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

interface EsimDetail {
  orderItemId?: string;
  packageName?: string;
  sims?: Array<Record<string, unknown>>;
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [queue, setQueue] = useState<AdminOrderQueue>("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<OrderStatus | "">("");
  const [paymentStatusInput, setPaymentStatusInput] = useState<PaymentStatus | "">("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<OrderStatus | "">("");
  const [appliedPaymentStatus, setAppliedPaymentStatus] = useState<PaymentStatus | "">("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [staffNote, setStaffNote] = useState("");
  const [esimResult, setEsimResult] = useState<EsimDetail[] | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(
    async (p: number) => {
      try {
        const extra: Record<string, string> = {};
        if (appliedSearch) extra.search = appliedSearch;
        if (appliedStatus) extra.status = mapOrderStatusToApi(appliedStatus);
        if (appliedPaymentStatus) extra.paymentStatus = appliedPaymentStatus;

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
    [appliedSearch, appliedStatus, appliedPaymentStatus]
  );

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const loadDetail = useCallback(async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = (await res.json()) as {
        success?: boolean;
        data?: { order: Record<string, unknown>; items?: Record<string, unknown>[]; payment?: Record<string, unknown> | null };
        message?: string;
      };
      if (!res.ok) throw new Error(json.message || "Lỗi tải chi tiết");
      const mapped = mapOrderDetailFromApi(json.data!);
      setDetail(mapped);
      setStaffNote(mapped.billNote || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải chi tiết");
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (detailId) void loadDetail(detailId);
    else setDetail(null);
  }, [detailId, loadDetail]);

  function applyFilters(e?: FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedStatus(statusInput);
    setAppliedPaymentStatus(paymentStatusInput);
    setQueue("all");
    setPage(1);
  }

  function selectQueue(next: AdminOrderQueue) {
    setQueue(next);
    const preset = ADMIN_ORDER_QUEUES.find((q) => q.key === next);
    if (!preset) return;

    setStatusInput((preset.filters.status as OrderStatus) || "");
    setPaymentStatusInput((preset.filters.paymentStatus as PaymentStatus) || "");
    setAppliedStatus((preset.filters.status as OrderStatus) || "");
    setAppliedPaymentStatus((preset.filters.paymentStatus as PaymentStatus) || "");
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setStatusInput("");
    setPaymentStatusInput("");
    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedPaymentStatus("");
    setQueue("all");
    setPage(1);
  }

  async function approvePayment(orderId: string) {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Duyệt thất bại");

      const esimDetails = (data.data?.esimDetails || []) as EsimDetail[];
      if (esimDetails.length > 0) {
        setEsimResult(esimDetails);
      } else {
        toast.success("Đã duyệt thanh toán — đơn chuyển sang Đang xử lý");
      }

      void load(page);
      if (detailId === orderId) void loadDetail(orderId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duyệt thất bại");
    } finally {
      setActionLoading(null);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus, note?: string) {
    setActionLoading(`${orderId}:${status}`);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staffNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");
      toast.success(`Đã cập nhật: ${formatOrderStatus(status)}`);
      void load(page);
      if (detailId === orderId) void loadDetail(orderId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally {
      setActionLoading(null);
    }
  }

  async function issueInvoice(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/invoice`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Xuất hóa đơn thất bại");
    toast.success(`Hóa đơn: ${data.data?.invoiceCode || "OK"}`);
  }

  const hasActiveFilters = Boolean(appliedSearch || appliedStatus || appliedPaymentStatus);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Đơn hàng</h1>
        <p className="text-sm text-slate-600">
          Duyệt chuyển khoản qua <code className="text-xs">approve-payment</code>, hoàn tất/hủy qua{" "}
          <code className="text-xs">PUT status</code>. Hiển thị cả trạng thái đơn và thanh toán.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ADMIN_ORDER_QUEUES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => selectQueue(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              queue === item.key
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={applyFilters}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="min-w-0 flex-1 sm:min-w-[220px]">
          <span className="mb-1 block text-xs font-bold text-slate-600">Tìm kiếm</span>
          <input
            type="search"
            className={inputClass}
            placeholder="Mã đơn, tên, SĐT, email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="w-full sm:w-48">
          <span className="mb-1 block text-xs font-bold text-slate-600">Trạng thái đơn</span>
          <select
            className={inputClass}
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as OrderStatus | "")}
          >
            {ORDER_STATUS_FILTER_VALUES.map((value) => (
              <option key={value || "all-status"} value={value}>
                {value ? formatOrderStatus(value) : "Tất cả"}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full sm:w-48">
          <span className="mb-1 block text-xs font-bold text-slate-600">Thanh toán</span>
          <select
            className={inputClass}
            value={paymentStatusInput}
            onChange={(e) => setPaymentStatusInput(e.target.value as PaymentStatus | "")}
          >
            {PAYMENT_STATUS_FILTER_VALUES.map((value) => (
              <option key={value || "all-payment"} value={value}>
                {value ? formatPaymentStatus(value) : "Tất cả"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2 text-sm">
            Lọc
          </button>
          {hasActiveFilters || queue !== "all" ? (
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

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Trạng thái đơn:</span>
        <OrderStatusBadge status="pending_payment" />
        <OrderStatusBadge status="payment_review" />
        <OrderStatusBadge status="processing" />
        <OrderStatusBadge status="completed" />
        <span className="mx-1 text-slate-300">|</span>
        <span className="font-semibold text-slate-800">Thanh toán:</span>
        <PaymentStatusBadge status="unpaid" />
        <PaymentStatusBadge status="pending_review" />
        <PaymentStatusBadge status="paid" />
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-bold">{order.code}</div>
                  <OrderStatusBadge status={order.status} />
                  {order.paymentStatus ? (
                    <PaymentStatusBadge status={order.paymentStatus} />
                  ) : null}
                  {order.channel ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {order.channel}
                    </span>
                  ) : null}
                </div>
                <div className={`mt-1 text-sm text-slate-600 ${adminBreakTextClass}`}>
                  {order.customerName} · {order.customerPhone} · {order.customerEmail}
                </div>
                {order.paymentStatus === "pending_review" ? (
                  <p className="mt-2 text-xs font-semibold text-blue-800">
                    Khách đã upload bill — cần duyệt thanh toán
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[#1d6be8]">{formatVnd(order.total)}</div>
                <div className="mt-1 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1d6be8] hover:underline"
                    onClick={() => setDetailId(order.id)}
                  >
                    Chi tiết
                  </button>
                  <a
                    href={`/don-hang/${order.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-slate-600 hover:underline"
                  >
                    Bill
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {canApprovePayment(order) ? (
                <button
                  type="button"
                  disabled={actionLoading === order.id}
                  className="rounded-full border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => void approvePayment(order.id)}
                >
                  {actionLoading === order.id ? "Đang duyệt…" : "Duyệt thanh toán"}
                </button>
              ) : null}
              {canCompleteOrder(order) ? (
                <button
                  type="button"
                  disabled={actionLoading === `${order.id}:completed`}
                  className="rounded-full border border-violet-600 bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                  onClick={() => void updateStatus(order.id, "completed")}
                >
                  Hoàn tất đơn
                </button>
              ) : null}
              {canCancelOrder(order) ? (
                <button
                  type="button"
                  disabled={actionLoading === `${order.id}:cancelled`}
                  className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  onClick={() => {
                    if (window.confirm(`Hủy đơn ${order.code}?`)) {
                      void updateStatus(order.id, "cancelled");
                    }
                  }}
                >
                  Hủy đơn
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => void issueInvoice(order.id)}
              >
                Xuất hóa đơn
              </button>
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

      {detailId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className={`card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 ${adminTableWrapClass}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">{detail?.code || "Chi tiết đơn"}</h2>
                {detail ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <OrderStatusBadge status={detail.status} />
                    {detail.paymentStatus ? (
                      <PaymentStatusBadge status={detail.paymentStatus} />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
                onClick={() => setDetailId(null)}
              >
                Đóng
              </button>
            </div>

            {detailLoading || !detail ? (
              <p className="mt-4 text-sm text-slate-500">Đang tải…</p>
            ) : (
              <>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <strong>Khách:</strong> {detail.customerName}
                  </div>
                  <div>
                    <strong>SĐT:</strong> {detail.customerPhone}
                  </div>
                  <div className="sm:col-span-2">
                    <strong>Email:</strong> {detail.customerEmail}
                  </div>
                </div>

                {detail.items.length > 0 ? (
                  <table className="mt-4 min-w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr>
                        <th className="py-2">Gói</th>
                        <th>SL</th>
                        <th className="text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item) => (
                        <tr key={item.packageId} className="border-t">
                          <td className="py-2">{item.packageName}</td>
                          <td>{item.quantity}</td>
                          <td className="text-right">{formatVnd(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}

                {detail.proofImageUrl ? (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-bold text-blue-900">Ảnh chuyển khoản</p>
                    {detail.paymentProof ? (
                      <p className="mt-1 text-xs text-blue-800">
                        Mã GD: {detail.paymentProof}
                      </p>
                    ) : null}
                    <a
                      href={detail.proofImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={detail.proofImageUrl}
                        alt="Proof"
                        className="max-h-48 rounded-lg border border-white shadow-sm"
                      />
                    </a>
                  </div>
                ) : detail.paymentStatus === "pending_review" ? (
                  <p className="mt-4 text-sm text-amber-700">Chưa có ảnh bill trong payment.</p>
                ) : null}

                <label className="mt-4 block text-sm">
                  <span className="font-semibold">Ghi chú nội bộ (staffNote)</span>
                  <textarea
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    rows={2}
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                  {canApprovePayment(detail) ? (
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      disabled={actionLoading === detail.id}
                      onClick={() => void approvePayment(detail.id)}
                    >
                      Duyệt thanh toán
                    </button>
                  ) : null}
                  {canCompleteOrder(detail) ? (
                    <button
                      type="button"
                      className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => void updateStatus(detail.id, "completed", staffNote)}
                    >
                      Hoàn tất đơn
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {esimResult ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
            <h3 className="text-lg font-black text-emerald-800">Đã duyệt — eSIM giao khách</h3>
            <div className="mt-3 space-y-3 text-sm">
              {esimResult.map((row, i) => (
                <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <div className="font-bold">{row.packageName}</div>
                  {(row.sims || []).map((sim, j) => (
                    <div key={j} className="mt-2 space-y-1 font-mono text-xs break-all">
                      {sim.iccid ? <div>ICCID: {String(sim.iccid)}</div> : null}
                      {sim.activationCode ? (
                        <div>Activation: {String(sim.activationCode)}</div>
                      ) : null}
                      {sim.qrCodeUrl ? (
                        <a
                          href={String(sim.qrCodeUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1d6be8] hover:underline"
                        >
                          Mở QR
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary mt-4 w-full"
              onClick={() => setEsimResult(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
