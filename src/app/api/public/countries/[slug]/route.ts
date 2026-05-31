import { publicGet } from "@/lib/api/public-route";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  return publicGet(`/public/countries/${slug}`);
}
