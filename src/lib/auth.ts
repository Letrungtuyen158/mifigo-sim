import { decodeJwtPayload, getAccessToken } from "./api/auth-token";
import { mapBackendUser, mapRoleFromApi } from "./api/mappers";
import {
  canAccessAdminPanel,
  canAdminWrite,
  isCustomerRole,
} from "./roles";
import type { User, UserRole } from "./types";

export async function getSessionUser(): Promise<Omit<User, "password"> | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.email.split("@")[0],
    role: mapRoleFromApi(payload.role),
  };
}

export async function getSessionRole(): Promise<UserRole | "guest"> {
  const user = await getSessionUser();
  return user?.role ?? "guest";
}

export function sanitizeUser(user: Omit<User, "password"> | User) {
  const { password, ...safe } = user as User;
  void password;
  return safe;
}

export { canAccessAdminPanel, canAdminWrite, isCustomerRole };

/** @deprecated Use canAccessAdminPanel */
export function canAccessAdmin(role: UserRole | string): boolean {
  return canAccessAdminPanel(role);
}

export function canAccessAgentPricing(role: UserRole | string): boolean {
  return role === "agent" || role === "collaborator" || role === "admin";
}

export { mapBackendUser };
