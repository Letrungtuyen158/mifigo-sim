import { adminGet } from "@/lib/api/admin-route";

export async function GET() {
  return adminGet("/admin/import/templates", undefined, "Lỗi tải danh sách file mẫu", true);
}
