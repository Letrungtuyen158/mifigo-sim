"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/layout/BrandLogo";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <BrandLogo showName={false} size={44} className="text-white" />
          <div className="mt-2 text-lg font-black text-white">{BRAND.name}</div>
          <p className="mt-2 text-sm text-slate-400">{BRAND.tagline}</p>
        </div>
        <div>
          <h4 className="font-bold text-white">Liên kết nhanh</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/tra-cuu">Tra cứu gói cước</Link>
            <Link href="/huong-dan">Hướng dẫn đặt SIM</Link>
            <Link href="/dat-hang">Giỏ hàng</Link>
            <Link href="/esim-vn">eSIM Việt Nam</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white">Hỗ trợ</h4>
          <p className="mt-3 text-sm text-slate-400">
            Hotline: 0964.596.973
            <br />
            Email: support@mifigo.vn
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {BRAND.name}. Phát triển theo từng giai đoạn.
      </div>
    </footer>
  );
}
