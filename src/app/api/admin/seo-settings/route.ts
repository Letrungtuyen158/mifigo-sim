import { adminGet, adminPut } from "@/lib/api/admin-route";

export async function GET() {
  return adminGet("/admin/seo-settings", undefined, "Lỗi tải SEO", true);
}

export async function PUT(req: Request) {
  const body = await req.json();
  return adminPut("/admin/seo-settings", body, "Cập nhật thất bại", true);
}
