import { NextResponse } from "next/server";
import { apiRequest, toNextError } from "@/lib/api/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
    };
    if (!body.token?.trim() || !body.newPassword) {
      return NextResponse.json(
        { success: false, message: "Thiếu token hoặc mật khẩu mới." },
        { status: 400 }
      );
    }
    const data = await apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: body.token.trim(),
        newPassword: body.newPassword,
      }),
    });
    return NextResponse.json({ success: true, message: data.message });
  } catch (error) {
    const { status, message } = toNextError(error, "Đặt lại mật khẩu thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
