import Link from "next/link";
import HeroQuickSearch from "@/components/home/HeroQuickSearch";
import OrderStepsSection from "@/components/home/OrderStepsSection";
import PopularCountriesSection from "@/components/home/PopularCountriesSection";
import { BRAND } from "@/lib/constants";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden pb-16 pt-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-travel.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#ecf3fb]/92 via-[#ecf3fb]/78 to-[#ecf3fb]/96"
          aria-hidden
        />

        <div className="container-page relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {BRAND.name}
              <span className="text-[#1d6be8]"> eSIM</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-700 sm:text-xl">
              Bay khắp thế giới
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> — </span>
              Không cần đổi SIM!
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-8 max-w-4xl">
          <HeroQuickSearch />
        </div>
      </section>

      <section className="container-page pb-12 pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Giới thiệu nhanh",
              desc: "Tra cứu gói theo quốc gia, loại gói, dung lượng GB và loại SIM.",
              href: "/tra-cuu",
            },
            {
              title: "Hướng dẫn",
              desc: "3 bước: chọn gói → thanh toán → nhận eSIM hoặc SIM vật lý.",
              href: "/huong-dan",
            },
            {
              title: "Giỏ hàng",
              desc: "Thêm gói vào giỏ, điền thông tin và gửi yêu cầu cho nhân viên.",
              href: "/dat-hang",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              <span className="mt-4 inline-block text-sm font-bold text-[#1d6be8]">
                Xem thêm →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <PopularCountriesSection />

      <OrderStepsSection />
    </div>
  );
}
