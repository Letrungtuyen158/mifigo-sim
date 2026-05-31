import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "./auth-token";
import { apiRequest, toNextError } from "./client";

export async function publicGet(path: string, req?: NextRequest, fallback = "Lỗi tải dữ liệu") {
  const token = await getAccessToken();
  const qs = req?.nextUrl.searchParams.toString();
  const url = qs ? `${path}?${qs}` : path;
  try {
    const data = await apiRequest(url, { token });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { status, message } = toNextError(error, fallback);
    return NextResponse.json({ success: false, message }, { status });
  }
}
