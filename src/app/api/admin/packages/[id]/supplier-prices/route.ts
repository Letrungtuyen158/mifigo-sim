import { adminGet } from "@/lib/api/admin-route";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return adminGet(`/admin/packages/${id}/supplier-prices`);
}
