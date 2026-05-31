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
      className={`flex shrink-0 items-center gap-2 font-black text-[#1d6be8] ${className}`}
      aria-label={`${brand.name} — Trang chủ`}
    >
      <Image
        src={brand.logoUrl}
        alt={brand.name}
        width={size}
        height={size}
        className="rounded-xl object-contain"
        priority
        unoptimized={remote}
      />
      {showName ? (
        <span className="hidden text-lg sm:inline sm:text-xl">{brand.name}</span>
      ) : null}
    </Link>
  );
}
