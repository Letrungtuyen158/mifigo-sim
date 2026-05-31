import { adminGet, adminPut } from "@/lib/api/admin-route";

export async function GET() {
  return adminGet("/admin/system-settings", undefined, "Lỗi tải cài đặt", true);
}

export async function PUT(req: Request) {
  const body = await req.json();
  return adminPut("/admin/system-settings", body, "Cập nhật thất bại", true);
}
