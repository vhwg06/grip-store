import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactMap } from "@/components/contact/contact-map";
import { FAQSection } from "@/components/contact/faq-section";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Liên hệ | GRIP",
  description: "Liên hệ với GRIP - Tổng kho tay nắm Việt Nam để được tư vấn và hỗ trợ.",
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="container mx-auto max-w-[1190px] px-4 py-8">
        <Breadcrumbs items={[{ label: "Liên hệ" }]} />
        
        <div className="mt-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Liên hệ với chúng tôi</h1>
              <p className="text-neutral-600 mb-8 text-lg">
                Bạn có câu hỏi về sản phẩm, đơn hàng hay cần tư vấn giải pháp nội thất? 
                Hãy để lại thông tin, đội ngũ chuyên gia của GRIP sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Địa chỉ</h3>
                    <p className="text-neutral-600">Trụ sở: 123 Đường ABC, Quận XYZ, TP. Hà Nội</p>
                    <p className="text-neutral-600">Showroom: 456 Đường DEF, Quận UVW, TP. HCM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Điện thoại</h3>
                    <p className="text-neutral-600">Hotline: 0987 654 321</p>
                    <p className="text-neutral-600">CSKH: 1900 1234</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-neutral-600">Chăm sóc khách hàng: support@grip.vn</p>
                    <p className="text-neutral-600">Liên hệ đối tác: partner@grip.vn</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-neutral-100">
        <ContactMap />
      </div>
      
      <div className="container mx-auto max-w-[1190px] px-4 py-8">
        <FAQSection />
      </div>
    </main>
  );
}
