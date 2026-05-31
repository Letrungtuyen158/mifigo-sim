import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapVnEsimFromApi } from "@/lib/api/mappers";
import { isStaffOrAdmin, requireAdmin } from "@/lib/api/require-admin";
import { getSessionUser } from "@/lib/auth";
import { ADMIN_LIST_LIMIT } from "@/lib/admin-list";

interface PaginatedInventory {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const token = await getAccessToken();
    if (!user || !token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = isStaffOrAdmin(user.role);

    if (isAdmin) {
      const { searchParams } = req.nextUrl;
      const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
      const limit = Math.min(
        100,
        Math.max(1, Number(searchParams.get("limit") || String(ADMIN_LIST_LIMIT)) || ADMIN_LIST_LIMIT)
      );
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });

      const data = await apiRequest<PaginatedInventory>(
        `/admin/sim-inventory?${qs.toString()}`,
        { token }
      );
      const esims = (data.items || []).map(mapVnEsimFromApi);
      return NextResponse.json({
        success: true,
        data: esims.map((e) => ({
          ...e,
          canExport: true,
        })),
        total: data.total,
        page: data.page,
        pageSize: data.limit,
        totalPages: data.totalPages,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      page: 1,
      pageSize: ADMIN_LIST_LIMIT,
      totalPages: 1,
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải eSIM");
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;
    const { token } = auth;

    const formData = await request.formData();
    const file = formData.get("file");
    const packageId = String(formData.get("packageId") || "").trim();
    const supplierId = String(formData.get("supplierId") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn file Excel/CSV." },
        { status: 400 }
      );
    }
    if (!packageId || !supplierId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn gói cước và nhà cung cấp." },
        { status: 400 }
      );
    }

    const upload = new FormData();
    upload.set("file", file);
    upload.set("simType", "esim");
    upload.set("packageId", packageId);
    upload.set("supplierId", supplierId);

    const result = await apiRequest<{ successRows?: number }>(
      "/admin/import/sim-inventory",
      {
        method: "POST",
        token,
        body: upload,
      }
    );

    return NextResponse.json({
      success: true,
      imported: result.successRows ?? 0,
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Import thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
