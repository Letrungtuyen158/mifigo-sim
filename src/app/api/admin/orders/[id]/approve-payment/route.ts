import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapOrderFromApi } from "@/lib/api/mappers";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    const token = await getAccessToken();
    if (!user || user.role !== "admin" || !token) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const result = await apiRequest<{
      order: Record<string, unknown>;
      esimDetails?: Array<Record<string, unknown>>;
    }>(`/admin/orders/${id}/approve-payment`, {
      method: "POST",
      token,
    });

    return NextResponse.json({
      success: true,
      data: {
        order: mapOrderFromApi(result.order),
        esimDetails: result.esimDetails ?? [],
      },
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Duyệt thanh toán thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
