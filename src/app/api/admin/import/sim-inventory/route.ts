import { adminPostForm } from "@/lib/api/admin-route";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const simType = String(formData.get("simType") || "").trim();
  const packageId = String(formData.get("packageId") || "").trim();
  const supplierId = String(formData.get("supplierId") || "").trim();

  if (!(file instanceof File) || !simType || !packageId || !supplierId) {
    return Response.json(
      {
        success: false,
        message: "Cần file Excel, simType, packageId và supplierId.",
      },
      { status: 400 }
    );
  }

  const upload = new FormData();
  upload.set("file", file);
  upload.set("simType", simType);
  upload.set("packageId", packageId);
  upload.set("supplierId", supplierId);

  return adminPostForm("/admin/import/sim-inventory", upload);
}
