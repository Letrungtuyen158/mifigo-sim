import { NextResponse } from "next/server";
import { getAccessToken } from "./auth-token";
import { getSessionUser } from "../auth";

export function isStaffOrAdmin(role: string | undefined): boolean {
  return role === "admin" || role === "staff";
}

/** Admin + staff — khớp BE cho orders, packages list, kho SIM, … */
export async function requireStaffOrAdmin() {
  const user = await getSessionUser();
  const token = await getAccessToken();
  if (!user || !isStaffOrAdmin(user.role) || !token) {
    return {
      response: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    } as const;
  }
  return { token, user } as const;
}

/** Chỉ admin — imports, customer-groups, activity-logs, … */
export async function requireAdmin() {
  const user = await getSessionUser();
  const token = await getAccessToken();
  if (!user || user.role !== "admin" || !token) {
    return {
      response: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    } as const;
  }
  return { token, user } as const;
}

export async function requireAuth() {
  const token = await getAccessToken();
  if (!token) {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    } as const;
  }
  return { token } as const;
}
