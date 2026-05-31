"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cartTotal, clearCart, readCart, removeFromCart, type CartItem } from "@/lib/cart";
import { formatSimType, formatVnd } from "@/lib/format";

export default function DatHangPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function handleRemove(packageId: string) {
    setCart(removeFromCart(packageId));
    toast.success("Đã xóa khỏi giỏ hàng");
  }

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("Giỏ trống. Hãy tra cứu và thêm gói cước trước.");
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin liên hệ.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          paymentNote: note,
          items: cart.map((c) => ({
            packageId: c.packageId,
            quantity: c.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đặt hàng thất bại");
      clearCart();
      toast.success("Đã tạo đơn hàng");
      router.push(`/don-hang/${data.data.code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black text-slate-900">Giỏ hàng</h1>
      <p className="mt-2 text-slate-600">
        Xem gói đã chọn, tạo đơn để nhân viên xuất bill và theo dõi thanh toán.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-bold">Giỏ hàng</h2>
          {cart.length === 0 ? (
            <div className="mt-4 text-sm text-slate-500">
              Chưa có gói nào.{" "}
              <Link href="/tra-cuu" className="font-bold text-[#1d6be8]">
                Tra cứu gói cước
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.packageId}
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{item.packageName}</div>
                    <div className="mt-1 text-slate-600">
                      {item.country} · {formatSimType(item.simType)} · SL: {item.quantity}
                    </div>
                    <div className="mt-1 font-bold text-[#1d6be8]">
                      {formatVnd(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Xóa khỏi giỏ hàng"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleRemove(item.packageId)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold">Thông tin đặt hàng</h2>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              placeholder="Họ tên *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              placeholder="Số điện thoại *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              placeholder="Ghi chú / mã giới thiệu"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between font-bold">
              <span>Tổng tạm tính</span>
              <span className="text-[#1d6be8]">{formatVnd(cartTotal(cart))}</span>
            </div>
            <button
              type="button"
              disabled={submitting}
              className="btn-primary mt-4 w-full disabled:opacity-60"
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Đang tạo đơn…" : "Tạo đơn hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
