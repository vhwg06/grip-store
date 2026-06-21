"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useAboutPage } from "@/application/hooks/useSiteConfig";

export function AboutContent() {
  const { aboutPage, isLoading } = useAboutPage();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-12 lg:py-24 space-y-12">
        <div className="h-12 w-48 bg-muted animate-pulse rounded-md mx-auto" />
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-full bg-muted animate-pulse rounded-md" />
          <div className="h-6 w-5/6 bg-muted animate-pulse rounded-md" />
          <div className="h-6 w-4/5 bg-muted animate-pulse rounded-md" />
        </div>
      </main>
    );
  }

  const hasDynamicContent = aboutPage && aboutPage.body.trim().length > 0;

  if (hasDynamicContent) {
    const hasGallery = Array.isArray(aboutPage.gallery) && aboutPage.gallery.length > 0;

    return (
      <main className="container mx-auto px-4 md:px-6 py-12 lg:py-24 space-y-16">
        {/* Dynamic Title Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h1 
            data-testid="about-title"
            className="text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground"
          >
            {aboutPage.title || "Về GRIP"}
          </h1>
        </section>

        {/* Dynamic Narrative Content */}
        <section className="max-w-3xl mx-auto">
          <div 
            data-testid="about-content" 
            className="prose prose-lg prose-neutral max-w-none dark:prose-invert leading-relaxed text-muted-foreground"
          >
            {(aboutPage.body || "").trim().startsWith("<") ? (
              <div dangerouslySetInnerHTML={{ __html: aboutPage.body }} />
            ) : (
              <ReactMarkdown>{aboutPage.body}</ReactMarkdown>
            )}
          </div>
        </section>

        {/* Dynamic Gallery Section */}
        {hasGallery ? (
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Thư viện ảnh</h2>
            </div>
            <div 
              data-testid="about-gallery"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {aboutPage.gallery.map((image, index) => (
                <div 
                  key={`${image}-${index}`} 
                  className="relative aspect-square rounded-2xl overflow-hidden bg-muted group shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Image
                    data-testid="about-gallery-image"
                    src={image}
                    alt={`${aboutPage.title} gallery image ${index + 1}`}
                    fill
                    sizes="(max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          // Hidden explicitly if empty to prevent broken UI
          <div data-testid="about-gallery" className="hidden" />
        )}
      </main>
    );
  }

  // Fallback to original static storefront design
  return (
    <main className="container mx-auto px-4 md:px-6 py-12 lg:py-24 space-y-24">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">Về GRIP</h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Chúng tôi là thương hiệu mang đến những sản phẩm thời trang và phụ kiện chất lượng cao, 
          kết hợp giữa thiết kế tối giản và tính ứng dụng thực tế.
        </p>
      </section>

      {/* Story Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
          <Image 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" 
            alt="GRIP Story"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Câu chuyện của chúng tôi</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Được thành lập với niềm đam mê sáng tạo và khát khao mang lại giá trị thực cho khách hàng, 
            GRIP bắt đầu từ một xưởng may nhỏ với những mẫu thiết kế đầu tiên được làm hoàn toàn thủ công.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Chúng tôi tin rằng thời trang không chỉ là những gì bạn mặc trên người, mà còn là cách bạn 
            thể hiện cá tính và quan điểm sống. Đó là lý do mỗi sản phẩm của GRIP đều được chăm chút tỉ mỉ 
            từ khâu chọn chất liệu đến từng đường kim mũi chỉ.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-muted/30 rounded-3xl p-8 md:p-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Giá trị cốt lõi</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">1</div>
            <h3 className="text-xl font-bold">Chất lượng</h3>
            <p className="text-muted-foreground">Cam kết sử dụng chất liệu tốt nhất và quy trình sản xuất nghiêm ngặt để tạo ra những sản phẩm bền bỉ với thời gian.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">2</div>
            <h3 className="text-xl font-bold">Tối giản</h3>
            <p className="text-muted-foreground">Thiết kế loại bỏ những chi tiết thừa, tập trung vào công năng và sự tinh tế trong từng đường nét.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">3</div>
            <h3 className="text-xl font-bold">Bền vững</h3>
            <p className="text-muted-foreground">Hướng tới sự phát triển bền vững bằng cách giảm thiểu tác động đến môi trường trong quá trình sản xuất.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
