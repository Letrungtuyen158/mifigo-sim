import { NextRequest } from "next/server";
import { adminGet, adminPut } from "@/lib/api/admin-route";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return adminGet(`/admin/packages/${id}`, req);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  return adminPut(`/admin/packages/${id}`, body, "Cập nhật thất bại", false, true);
}
