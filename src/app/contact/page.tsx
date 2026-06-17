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
              
              <div data-testid="contact-company-info" className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Địa chỉ văn phòng</h3>
                    <p className="text-neutral-600">Số 05TH AVE, SunriseE, KDT The Manor Nguyễn Xiển, P.Đại Kim, Hoàng Mai, Hà Nội</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Số điện thoại liên hệ</h3>
                    <p className="text-neutral-600">(+84) 985694444</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-neutral-600">Giải đáp thắc mắc qua <a href="mailto:support@grip.com" className="text-primary hover:underline">support@grip.com</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Giờ làm việc</h3>
                    <p className="text-neutral-600"><span className="font-semibold">T2-T6:</span> 9:00 AM - 6:00 PM</p>
                    <p className="text-neutral-600"><span className="font-semibold">T7:</span> 9:00 AM - 5:00 PM</p>
                    <p className="text-neutral-600"><span className="font-semibold">CN:</span> NGHỈ</p>
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
