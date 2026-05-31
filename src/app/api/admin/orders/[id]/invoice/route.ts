import { adminPost } from "@/lib/api/admin-route";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return adminPost(`/admin/orders/${id}/issue-invoice`, {}, "Xuất hóa đơn thất bại");
}
