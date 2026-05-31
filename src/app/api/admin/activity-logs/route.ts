import { NextRequest } from "next/server";
import { adminGet } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/activity-logs", req, "Lỗi tải dữ liệu", true);
}
