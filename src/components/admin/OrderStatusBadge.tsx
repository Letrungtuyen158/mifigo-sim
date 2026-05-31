import { formatOrderStatus } from "@/lib/format";
import { orderStatusBadgeClass } from "@/lib/order-status-ui";

export default function OrderStatusBadge({
  status,
  label,
  className = "",
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${orderStatusBadgeClass(status)} ${className}`}
    >
      {label ?? formatOrderStatus(status)}
    </span>
  );
}
