import { NextRequest } from "next/server";
import { adminGet, adminPost } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/sale-price-rules", req);
}

export async function POST(req: Request) {
  const body = await req.json();
  return adminPost("/admin/sale-price-rules", body, "Tạo thất bại", true);
}
