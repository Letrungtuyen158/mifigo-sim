import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import {
  buildBankSettings,
  isMongoId,
  mapOrderFromApi,
} from "@/lib/api/mappers";
import { decodeJwtPayload } from "@/lib/api/auth-token";

interface OrderDetailResponse {
  order: Record<string, unknown>;
  items: Record<string, unknown>[];
  payment?: Record<string, unknown> | null;
}

interface PaginatedOrders {
  items: Record<string, unknown>[];
}

async function findOrderByCodeOrId(
  idOrCode: string,
  token: string
): Promise<OrderDetailResponse | null> {
  const payload = decodeJwtPayload(token);
  const isAdmin = payload?.role === "admin" || payload?.role === "staff";
  const base = isAdmin ? "/admin/orders" : "/customer/orders";

  if (isMongoId(idOrCode)) {
    try {
      return await apiRequest<OrderDetailResponse>(`${base}/${idOrCode}`, { token });
    } catch {
      return null;
    }
  }

  const list = await apiRequest<PaginatedOrders>(
    `${base}?search=${encodeURIComponent(idOrCode)}&limit=20`,
    { token }
  );
  const match = (list.items || []).find(
    (o) => String(o.orderCode || o.code) === idOrCode
  );
  if (!match) return null;

  const orderId = String(match._id || match.id);
  return apiRequest<OrderDetailResponse>(`${base}/${orderId}`, { token });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để xem đơn hàng." },
        { status: 401 }
      );
    }

    const detail = await findOrderByCodeOrId(id, token);
    if (!detail) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng." },
        { status: 404 }
      );
    }

    const order = mapOrderFromApi(detail.order, detail.items, detail.payment);
    const settings = buildBankSettings(detail.payment);

    return NextResponse.json({
      success: true,
      data: order,
      settings,
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải đơn hàng");
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      paymentProof?: string;
      status?: string;
    };

    const detail = await findOrderByCodeOrId(id, token);
    if (!detail) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng." },
        { status: 404 }
      );
    }

    const orderId = String(detail.order._id || detail.order.id);

    if (body.paymentProof) {
      const placeholderPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("transactionCode", body.paymentProof);
      formData.set(
        "proofImage",
        new Blob([placeholderPng], { type: "image/png" }),
        "proof.png"
      );

      await apiRequest("/customer/payments/upload-proof", {
        method: "POST",
        token,
        body: formData,
      });
    }

    const refreshed = await findOrderByCodeOrId(orderId, token);
    const order = mapOrderFromApi(
      refreshed!.order,
      refreshed!.items,
      refreshed!.payment
    );

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const { status, message } = toNextError(error, "Cập nhật thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
