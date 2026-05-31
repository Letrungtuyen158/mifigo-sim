import { publicGet } from "@/lib/api/public-route";

export async function GET() {
  return publicGet("/public/system-settings");
}
