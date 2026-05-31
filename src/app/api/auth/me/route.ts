import { NextResponse } from "next/server";
import { getSessionUser, sanitizeUser } from "@/lib/auth";
import { mapRoleFromApi } from "@/lib/api/mappers";
import { decodeJwtPayload, getAccessToken } from "@/lib/api/auth-token";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, role: "guest" });
  }

  const token = await getAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const role = mapRoleFromApi(payload?.role || user.role);

  return NextResponse.json({
    user: sanitizeUser(user),
    role,
  });
}
