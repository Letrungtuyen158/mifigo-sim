import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapOrderFromApi, mapOrderStatusToApi } from "@/lib/api/mappers";
import { requireStaffOrAdmin } from "@/lib/api/require-admin";
import { adminGet } from "@/lib/api/admin-route";

export async function GET(req: NextRequest) {
  return adminGet("/admin/orders", req);
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireStaffOrAdmin();
    if ("response" in auth) return auth.response;
    const { token } = auth;

    const body = (await request.json()) as {
      orderId?: string;
      status?: string;
      billNote?: string;
    };

    if (!body.orderId) {
      return NextResponse.json(
        { success: false, message: "Thiếu orderId." },
        { status: 400 }
      );
    }

    if (body.status === "paid") {
      const result = await apiRequest<{
        order: Record<string, unknown>;
      }>(`/admin/orders/${body.orderId}/approve-payment`, {
        method: "POST",
        token,
      });
      const order = mapOrderFromApi(result.order);
      return NextResponse.json({ success: true, data: order });
    }

    const result = await apiRequest<Record<string, unknown>>(
      `/admin/orders/${body.orderId}/status`,
      {
        method: "PUT",
        token,
        body: JSON.stringify({
          status: mapOrderStatusToApi(body.status),
          staffNote: body.billNote,
        }),
      }
    );

    const order = mapOrderFromApi(result);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const { status, message } = toNextError(error, "Cập nhật thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
