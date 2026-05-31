"use client";

import Image from "next/image";
import Link from "next/link";
import { isRemoteLogo } from "@/lib/brand";
import { useBrand } from "@/contexts/BrandContext";

export default function BrandLogo({
  showName = true,
  size = 40,
  className = "",
}: {
  showName?: boolean;
  size?: number;
  className?: string;
}) {
  const brand = useBrand();
  const remote = isRemoteLogo(brand.logoUrl);

  return (
    <Link
      href="/"
      className={`flex min-w-0 max-w-[min(100%,14rem)] shrink-0 items-center gap-2 font-black text-[#1d6be8] sm:max-w-[16rem] ${className}`}
      aria-label={`${brand.name} — Trang chủ`}
      title={brand.name}
    >
      <Image
        src={brand.logoUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-contain"
        style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
        priority
        unoptimized={remote}
      />
      {showName ? (
        <span className="hidden truncate text-lg sm:inline sm:max-w-[9rem] sm:text-xl md:max-w-[11rem] lg:max-w-[13rem]">
          {brand.name}
        </span>
      ) : null}
    </Link>
  );
}
