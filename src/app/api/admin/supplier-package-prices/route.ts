import { adminPost } from "@/lib/api/admin-route";

export async function POST(req: Request) {
  const body = await req.json();
  return adminPost("/admin/supplier-package-prices", body);
}
