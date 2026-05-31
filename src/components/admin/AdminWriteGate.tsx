"use client";

import { useCanAdminWrite } from "@/contexts/AdminRoleContext";

export default function AdminWriteGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const canWrite = useCanAdminWrite();
  if (!canWrite) return <>{fallback}</>;
  return <>{children}</>;
}
