import { NextResponse } from "next/server";
import { adminPostForm } from "@/lib/api/admin-route";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const assetType = String(formData.get("assetType") || "").trim();

  if (!(file instanceof File) || !assetType) {
    return NextResponse.json(
      { success: false, message: "Cần assetType và file." },
      { status: 400 }
    );
  }

  const upload = new FormData();
  upload.set("file", file);
  upload.set("assetType", assetType);

  return adminPostForm("/admin/system-settings/upload-asset", upload);
}
