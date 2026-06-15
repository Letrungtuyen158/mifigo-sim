import { NextResponse } from "next/server";
import { adminPostForm } from "@/lib/api/admin-route";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const supplierId = String(formData.get("supplierId") || "").trim();
  const simType = String(formData.get("simType") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Vui lòng chọn file Excel." },
      { status: 400 }
    );
  }
  if (!supplierId) {
    return NextResponse.json(
      { success: false, message: "Vui lòng chọn nhà cung cấp." },
      { status: 400 }
    );
  }
  if (simType !== "esim" && simType !== "physical_sim") {
    return NextResponse.json(
      { success: false, message: "Loại SIM không hợp lệ." },
      { status: 400 }
    );
  }

  const upload = new FormData();
  upload.set("file", file);
  upload.set("supplierId", supplierId);
  upload.set("simType", simType);

  return adminPostForm("/admin/import/supplier-packages", upload);
}
