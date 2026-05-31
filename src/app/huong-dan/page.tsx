import Link from "next/link";

export default function HuongDanPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-black text-slate-900">Hướng dẫn đặt SIM / eSIM</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Quy trình đơn giản để khách chủ động tìm gói và nhân viên xử lý nhanh.
      </p>

      <div className="mt-8 grid gap-4">
        {[
          {
            step: "Bước 1",
            title: "Tra cứu gói cước",
            body: "Vào mục Tra cứu, chọn quốc gia, loại gói (theo ngày/tổng/không giới hạn), dung lượng GB và loại SIM (eSIM hoặc vật lý). Hệ thống hiển thị gói phù hợp kèm đơn giá.",
            href: "/tra-cuu",
          },
          {
            step: "Bước 2",
            title: "Thêm vào đơn & điền thông tin",
            body: "Nhấn “Thêm vào đơn”, mở giỏ hàng (icon góc phải), điền họ tên, SĐT, email. Đại lý/CTV đăng nhập để xem bậc giá theo số lượng (3 mức).",
            href: "/dat-hang",
          },
          {
            step: "Bước 3",
            title: "Thanh toán & nhận hàng",
            body: "Chuyển khoản theo thông tin trên bill. Nhân viên duyệt thanh toán thủ công, sau đó xuất eSIM (QR/mã) hoặc giao SIM vật lý.",
            href: "/dat-hang",
          },
        ].map((item) => (
          <div key={item.step} className="card p-6">
            <div className="text-sm font-bold uppercase tracking-wide text-[#1d6be8]">
              {item.step}
            </div>
            <h2 className="mt-1 text-xl font-bold">{item.title}</h2>
            <p className="mt-2 text-slate-600">{item.body}</p>
            <Link href={item.href} className="mt-4 inline-block text-sm font-bold text-[#1d6be8]">
              Bắt đầu →
            </Link>
          </div>
        ))}
      </div>

      <div className="card mt-8 bg-blue-50 p-6">
        <h3 className="font-bold text-slate-900">Phân quyền giá</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Khách lẻ (anonymous): xem giá bán lẻ.</li>
          <li>Đại lý / CTV: giá riêng, giảm dần theo 3 bậc số lượng.</li>
          <li>Admin: nhập giá nhà cung cấp, so sánh và chỉnh giá bán từng kênh.</li>
        </ul>
      </div>
    </div>
  );
}
