import { adminGet, adminPut } from "@/lib/api/admin-route";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return adminGet(`/admin/users/${id}`);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();
  return adminPut(`/admin/users/${id}`, body);
}
