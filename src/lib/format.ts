export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function formatPackageType(type: string): string {
  switch (type) {
    case "daily":
      return "Theo ngày";
    case "total":
      return "Tổng dung lượng";
    case "unlimited":
      return "Không giới hạn";
    default:
      return type;
  }
}

export function formatSimType(type: string): string {
  if (type === "esim") return "eSIM";
  if (type === "physical_sim" || type === "physical") return "SIM vật lý";
  return type;
}

export function formatDataGb(gb: number | null): string {
  if (gb == null) return "Không giới hạn";
  return `${gb} GB`;
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Chờ thanh toán";
    case "payment_review":
    case "waiting_payment_confirmation":
      return "Chờ duyệt chuyển khoản";
    case "paid":
      return "Đã thanh toán";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn tất";
    case "cancelled":
      return "Đã hủy";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
}

export function formatSimInventoryStatus(status: string): string {
  switch (status) {
    case "available":
      return "Sẵn sàng";
    case "reserved":
      return "Đã giữ";
    case "sold":
      return "Đã bán";
    case "expired":
      return "Hết hạn";
    case "disabled":
      return "Vô hiệu";
    default:
      return status;
  }
}

export function formatUserRole(role: string): string {
  switch (role) {
    case "customer":
      return "Khách lẻ";
    case "agent":
      return "Đại lý";
    case "collaborator":
      return "CTV";
    case "staff":
      return "Nhân viên";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export function formatUserStatus(status: string): string {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Ngưng";
    case "blocked":
      return "Khóa";
    default:
      return status;
  }
}

export function formatPaymentStatus(status: string): string {
  switch (status) {
    case "unpaid":
      return "Chưa thanh toán";
    case "pending_review":
      return "Chờ duyệt CK";
    case "paid":
      return "Đã thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
}
