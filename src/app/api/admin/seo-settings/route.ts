import { adminGet, adminPut } from "@/lib/api/admin-route";

export async function GET() {
  return adminGet("/admin/seo-settings");
}

export async function PUT(req: Request) {
  const body = await req.json();
  return adminPut("/admin/seo-settings", body);
}
