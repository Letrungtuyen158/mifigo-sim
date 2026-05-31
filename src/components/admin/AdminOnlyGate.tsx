"use client";

import { useIsAdmin } from "@/contexts/AdminRoleContext";

export default function AdminOnlyGate({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    return (
      <div className="card p-6 text-sm text-slate-600">
        Màn hình này chỉ dành cho tài khoản <strong>admin</strong>.
      </div>
    );
  }
  return <>{children}</>;
}
