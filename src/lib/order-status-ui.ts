import type { OrderStatus } from "@/lib/types";

/** Badge: nền + chữ + viền nhẹ */
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

/** Nút đổi trạng thái khi đang khớp đơn */
export const ORDER_ACTION_ACTIVE: Record<string, string> = {
  payment_review: "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25",
  paid: "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
  completed:
    "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-600/25",
  cancelled: "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25",
};

export const ORDER_ACTION_IDLE =
  "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";

export interface OrderStatusAction {
  key: OrderStatus;
  label: string;
  matches: OrderStatus[];
}

export const ORDER_STATUS_ACTIONS: OrderStatusAction[] = [
  {
    key: "payment_review",
    label: "Chờ duyệt CK",
    matches: ["payment_review"],
  },
  {
    key: "paid",
    label: "Đã thanh toán",
    matches: ["paid", "processing"],
  },
  {
    key: "completed",
    label: "Hoàn tất",
    matches: ["completed"],
  },
  {
    key: "cancelled",
    label: "Hủy",
    matches: ["cancelled"],
  },
];

export function isOrderActionActive(
  orderStatus: OrderStatus,
  action: OrderStatusAction
) {
  return action.matches.includes(orderStatus);
}

export function orderStatusBadgeClass(status: string) {
  return (
    ORDER_STATUS_BADGE[status] ??
    "bg-slate-100 text-slate-700 ring-slate-200/80"
  );
}
