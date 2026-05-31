import { NextRequest } from "next/server";
import { adminGet } from "@/lib/api/admin-route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return adminGet(`/admin/orders/${id}`, req, "Không tải được chi tiết đơn");
}
