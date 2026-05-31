"use client";

import { createContext, useContext } from "react";

const AdminRoleContext = createContext<string>("guest");

export function AdminRoleProvider({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return <AdminRoleContext.Provider value={role}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}

export function useIsAdmin() {
  return useAdminRole() === "admin";
}
