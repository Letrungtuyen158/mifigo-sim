import { NextRequest } from "next/server";
import { adminGet } from "@/lib/api/admin-route";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return adminGet(`/admin/packages/${id}/supplier-prices`, req);
}
