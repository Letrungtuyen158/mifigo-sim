import { NextResponse } from "next/server";
import { adminPostForm } from "@/lib/api/admin-route";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const supplierId = String(formData.get("supplierId") || "").trim();

  if (!(file instanceof File) || !supplierId) {
    return NextResponse.json(
      { success: false, message: "Cần file Excel và supplierId." },
      { status: 400 }
    );
  }

  const upload = new FormData();
  upload.set("file", file);
  upload.set("supplierId", supplierId);
  const packageId = String(formData.get("packageId") || "").trim();
  if (packageId) upload.set("packageId", packageId);

  return adminPostForm("/admin/import/supplier-prices", upload);
}
