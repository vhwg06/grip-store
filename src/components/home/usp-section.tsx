import { Truck, Star, Award, PhoneCall } from "lucide-react";

export function USPSection() {
  const usps = [
    { icon: Truck, title: "Vận chuyển miễn phí", desc: "Đơn hàng từ 2 triệu" },
    { icon: Star, title: "Ưu đãi khách hàng VIP", desc: "Chiết khấu lên đến 20%" },
    { icon: Award, title: "Chứng nhận chất lượng", desc: "Bảo hành 2 năm" },
    { icon: PhoneCall, title: "HOTLINE", desc: "Hỗ trợ 24/7" },
  ];

  return (
    <section className="py-12 bg-neutral-50 border-y border-neutral-100">
      <div className="container mx-auto max-w-[1190px] px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {usps.map((usp, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <usp.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">{usp.title}</h3>
              <p className="text-sm text-neutral-500">{usp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
