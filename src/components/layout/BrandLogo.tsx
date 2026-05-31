import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function BrandLogo({
  showName = true,
  size = 40,
  className = "",
}: {
  showName?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center gap-2 font-black text-[#1d6be8] ${className}`}
      aria-label="Mifigo SIM — Trang chủ"
    >
      <Image
        src="/logo.svg"
        alt="Mifigo SIM"
        width={size}
        height={size}
        className="rounded-xl"
        priority
      />
      {showName ? (
        <span className="hidden text-lg sm:inline sm:text-xl">{BRAND.name}</span>
      ) : null}
    </Link>
  );
}
