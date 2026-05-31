import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/constants";
import { apiRequest, toNextError } from "@/lib/api/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      confirmPassword?: string;
    };

    const fullName = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu xác nhận không khớp." },
        { status: 400 }
      );
    }

    const data = await apiRequest<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, phone, password }),
    });

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Đăng ký thất bại");
    return NextResponse.json(
      {
        success: false,
        message:
          status === 409 ? "Email đã được sử dụng." : message,
      },
      { status: status === 409 ? 409 : status }
    );
  }
}
