import { Truck, Star, Award, PhoneCall } from "lucide-react";

export function USPSection() {
  const usps = [
    { icon: Truck, title: "VẬN CHUYỂN MIỄN PHÍ", desc: "Đơn hàng từ 2 triệu đồng" },
    { icon: Star, title: "ƯU ĐÃI KHÁCH HÀNG VIP", desc: "Chiết khấu đại lý lên đến 20%" },
    { icon: Award, title: "CHỨNG NHẬN CHẤT LƯỢNG", desc: "Bảo hành chính hãng 2 năm" },
    { icon: PhoneCall, title: "HOTLINE HỖ TRỢ", desc: "Tư vấn kỹ thuật 24/7" },
  ];

  return (
    <section className="py-16 bg-[#fcfbfa] border-y border-[#9c702a]/10">
      <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usps.map((usp, i) => (
            <div 
              key={i} 
              className="group flex flex-col items-center text-center p-8 bg-white border border-[#c0a060]/20 rounded-lg transition-all duration-300 hover:border-[#c0a060] hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(43,24,9,0.08)]"
            >
              <div className="w-14 h-14 border border-[#c0a060]/30 rounded-full flex items-center justify-center mb-5 group-hover:bg-[#c0a060]/10 transition-all duration-300">
                <usp.icon className="w-6 h-6 text-[#9c702a]" />
              </div>
              <h3 className="font-bold text-[15px] text-[#2b1809] tracking-wider mb-2 font-['SVN-Gilroy']">
                {usp.title}
              </h3>
              <p className="text-sm text-[#5c4d42] font-medium font-['SVN-Gilroy']">
                {usp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
