import { formatPaymentStatus } from "@/lib/format";
import { paymentStatusBadgeClass } from "@/lib/order-status-ui";

export default function PaymentStatusBadge({
  status,
  label,
  className = "",
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${paymentStatusBadgeClass(status)} ${className}`}
    >
      {label ?? formatPaymentStatus(status)}
    </span>
  );
}
