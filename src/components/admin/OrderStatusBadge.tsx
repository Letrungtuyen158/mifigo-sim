import { formatOrderStatus } from "@/lib/format";
import { orderStatusBadgeClass } from "@/lib/order-status-ui";

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${orderStatusBadgeClass(status)}`}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
