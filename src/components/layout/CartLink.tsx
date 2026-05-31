"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { cartCount, readCart } from "@/lib/cart";

export default function CartLink({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setCount(cartCount(readCart()));
    }
    refresh();
    window.addEventListener("cart:updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart:updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  const active = pathname === "/dat-hang";

  return (
    <Link
      href="/dat-hang"
      aria-label={t("common.cart")}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 ${
        active
          ? "border-[#1d6be8]/40 bg-[#1d6be8]/10 text-[#1d6be8]"
          : "border-slate-200"
      } ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f97316] px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
