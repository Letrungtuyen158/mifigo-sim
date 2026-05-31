import { NextRequest } from "next/server";
import { adminGet, adminPost } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/customer-groups", req, "Lỗi tải dữ liệu", true);
}

export async function POST(req: Request) {
  const body = await req.json();
  return adminPost("/admin/customer-groups", body, "Tạo thất bại", true);
}
