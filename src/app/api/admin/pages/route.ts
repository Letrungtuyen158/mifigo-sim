import { NextRequest } from "next/server";
import { adminGet, adminPost } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/pages", req, "Lỗi tải trang", true);
}

export async function POST(req: Request) {
  const body = await req.json();
  return adminPost("/admin/pages", body, "Tạo thất bại", true);
}
