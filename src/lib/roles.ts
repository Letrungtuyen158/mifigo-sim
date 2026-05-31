import type { UserRole } from "./types";

export const CUSTOMER_ROLES = ["customer", "agent", "collaborator"] as const;
export const ADMIN_PANEL_ROLES = ["staff", "admin"] as const;

export type CustomerRole = (typeof CUSTOMER_ROLES)[number];
export type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[number];

export function isCustomerRole(role: string | undefined): role is CustomerRole {
  return CUSTOMER_ROLES.includes(role as CustomerRole);
}

export function isAdminPanelRole(role: string | undefined): role is AdminPanelRole {
  return ADMIN_PANEL_ROLES.includes(role as AdminPanelRole);
}

export function canAccessAdminPanel(role: string | undefined): boolean {
  return isAdminPanelRole(role);
}

export function canAdminWrite(role: string | undefined): boolean {
  return role === "admin";
}

export function shouldShowStorefrontCheckout(role: string | undefined): boolean {
  return isCustomerRole(role) || role === "guest" || !role;
}

export function postLoginPath(role: UserRole | string): string {
  return canAccessAdminPanel(role) ? "/admin" : "/tra-cuu";
}
