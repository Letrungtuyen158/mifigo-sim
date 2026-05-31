"use client";

import Link from "next/link";
import { useState } from "react";

type SimTab = "esim" | "physical";

const STEPS: Record<
  SimTab,
  { num: string; title: string; desc: string; emoji: string }[]
> = {
  esim: [
    {
      num: "01",
      emoji: "🗺️",
      title: "Chọn địa điểm và gói phù hợp",
      desc: "Tra cứu gói eSIM theo quốc gia, số ngày, dung lượng GB và xem đơn giá.",
    },
    {
      num: "02",
      emoji: "💳",
      title: "Thanh toán và nhận mã QR",
      desc: "Tạo đơn, chuyển khoản theo bill. Nhân viên duyệt và gửi QR eSIM cho khách.",
    },
    {
      num: "03",
      emoji: "📱",
      title: "Cài đặt và kích hoạt eSIM",
      desc: "Quét mã QR trên điện thoại, bật eSIM là dùng ngay — chỉ mất 1–2 phút.",
    },
  ],
  physical: [
    {
      num: "01",
      emoji: "🗺️",
      title: "Chọn gói SIM vật lý",
      desc: "Lọc theo quốc gia, dung lượng, số ngày và xem giá SIM vật lý phù hợp.",
    },
    {
      num: "02",
      emoji: "💳",
      title: "Đặt hàng & thanh toán",
      desc: "Điền thông tin liên hệ, chuyển khoản theo hướng dẫn trên bill đơn hàng.",
    },
    {
      num: "03",
      emoji: "📦",
      title: "Nhận SIM và kích hoạt",
      desc: "Nhân viên giao SIM vật lý hoặc hướng dẫn lắp SIM, kích hoạt trước khi bay.",
    },
  ],
};

export default function OrderStepsSection() {
  const [tab, setTab] = useState<SimTab>("esim");
  const steps = STEPS[tab];

  return (
    <section className="bg-white py-14">
      <div className="container-page">
        <h2 className="text-2xl font-black text-slate-900">3 bước đặt SIM</h2>

        <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("esim")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              tab === "esim"
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            eSIM
          </button>
          <button
            type="button"
            onClick={() => setTab("physical")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              tab === "physical"
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SIM
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="card overflow-hidden p-0">
              <div className="flex h-28 items-center justify-center bg-[#ecf3fb] text-4xl">
                {step.emoji}
              </div>
              <div className="p-5">
                <div className="text-3xl font-black text-[#1d6be8]/25">{step.num}</div>
                <h3 className="mt-1 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/tra-cuu?simType=${tab}`}
            className="btn-primary inline-flex h-11 items-center px-8"
          >
            {tab === "esim" ? "Khám phá eSIM" : "Khám phá SIM vật lý"}
          </Link>
        </div>
      </div>
    </section>
  );
}
