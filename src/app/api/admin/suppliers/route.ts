import { adminGet, adminPost } from "@/lib/api/admin-route";

export async function GET() {
  return adminGet("/admin/suppliers");
}

export async function POST(req: Request) {
  const body = await req.json();
  return adminPost("/admin/suppliers", body);
}
