"use client";

import { useCanAdminWrite } from "@/contexts/AdminRoleContext";

export default function StaffReadOnlyBanner() {
  const canWrite = useCanAdminWrite();
  if (canWrite) return null;
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      Bạn đang ở chế độ xem (nhân viên). Chỉ admin mới được tạo hoặc chỉnh sửa dữ liệu
      này; đơn hàng vẫn xử lý bình thường.
    </p>
  );
}
