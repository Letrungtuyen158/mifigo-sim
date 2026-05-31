import { NextRequest } from "next/server";
import { adminGet } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/sim-inventory/low-stock", req);
}
