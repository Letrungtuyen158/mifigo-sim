import { adminPut } from "@/lib/api/admin-route";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  return adminPut(`/admin/sale-price-rules/${id}`, body, "Cập nhật thất bại", true);
}
