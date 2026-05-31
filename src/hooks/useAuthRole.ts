"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

export function useAuthRole() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | "guest">("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setRole((d.role as UserRole) ?? "guest");
      })
      .catch(() => {
        if (!cancelled) setRole("guest");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { role, loading };
}
