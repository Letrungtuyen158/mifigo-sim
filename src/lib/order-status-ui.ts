import type { OrderStatus, PaymentStatus } from "@/lib/types";

/** Badge đơn hàng (`order.status`) */
export const ORDER_STATUS_BADGE: Record<string, string> = {
  pending_payment:
    "bg-amber-50 text-amber-900 ring-amber-200/80",
  payment_review:
    "bg-blue-50 text-blue-900 ring-blue-200/80",
  waiting_payment_confirmation:
    "bg-blue-50 text-blue-900 ring-blue-200/80",
  paid: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  processing: "bg-sky-50 text-sky-900 ring-sky-200/80",
  completed: "bg-violet-50 text-violet-900 ring-violet-200/80",
  cancelled: "bg-red-50 text-red-900 ring-red-200/80",
  refunded: "bg-slate-100 text-slate-700 ring-slate-200/80",
  draft: "bg-slate-100 text-slate-600 ring-slate-200/80",
};

/** Badge thanh toán (`order.paymentStatus`) */
export const PAYMENT_STATUS_BADGE: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-900 ring-amber-200/80",
  pending_review: "bg-blue-50 text-blue-900 ring-blue-200/80",
  paid: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  failed: "bg-red-50 text-red-900 ring-red-200/80",
  refunded: "bg-slate-100 text-slate-700 ring-slate-200/80",
};

export function orderStatusBadgeClass(status: string) {
  return (
    ORDER_STATUS_BADGE[status] ??
    "bg-slate-100 text-slate-700 ring-slate-200/80"
  );
}

export function paymentStatusBadgeClass(status: string) {
  return (
    PAYMENT_STATUS_BADGE[status] ??
    "bg-slate-100 text-slate-700 ring-slate-200/80"
  );
}

/** Có thể duyệt CK — POST approve-payment */
export function canApprovePayment(order: {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}) {
  if (order.paymentStatus === "paid") return false;
  if (["completed", "cancelled", "refunded"].includes(order.status)) return false;
  return (
    order.paymentStatus === "pending_review" || order.status === "payment_review"
  );
}

/** Hoàn tất đơn — PUT status completed */
export function canCompleteOrder(order: {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}) {
  return order.status === "processing" && order.paymentStatus === "paid";
}

/** Hủy đơn — PUT status cancelled */
export function canCancelOrder(order: { status: OrderStatus }) {
  return !["completed", "cancelled", "refunded"].includes(order.status);
}

export type AdminOrderQueue = "all" | "pending_review" | "processing" | "completed";

export const ADMIN_ORDER_QUEUES: {
  key: AdminOrderQueue;
  label: string;
  filters: Record<string, string>;
}[] = [
  { key: "all", label: "Tất cả", filters: {} },
  {
    key: "pending_review",
    label: "Chờ duyệt CK",
    filters: { paymentStatus: "pending_review" },
  },
  {
    key: "processing",
    label: "Đang xử lý",
    filters: { status: "processing", paymentStatus: "paid" },
  },
  {
    key: "completed",
    label: "Hoàn tất",
    filters: { status: "completed" },
  },
];

export const ORDER_STATUS_FILTER_VALUES: (OrderStatus | "")[] = [
  "",
  "pending_payment",
  "payment_review",
  "processing",
  "completed",
  "cancelled",
  "refunded",
];

export const PAYMENT_STATUS_FILTER_VALUES: (PaymentStatus | "")[] = [
  "",
  "unpaid",
  "pending_review",
  "paid",
  "failed",
  "refunded",
];
