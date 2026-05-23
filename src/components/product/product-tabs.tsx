"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductTabsProps {
  description?: string | null;
  usageGuide?: string | null;
  reviewCount?: number;
}

export function ProductTabs({ description, usageGuide, reviewCount = 0 }: ProductTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full mt-16">
      <TabsList className="w-full border-b rounded-none bg-transparent h-auto p-0 justify-start gap-8 mb-8">
        <TabsTrigger 
          value="details" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold text-lg"
        >
          Chi tiết sản phẩm
        </TabsTrigger>
        <TabsTrigger 
          value="guide" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold text-lg"
        >
          Hướng dẫn sử dụng
        </TabsTrigger>
        <TabsTrigger 
          value="reviews" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 font-bold text-lg"
        >
          Đánh giá <span className="ml-2 bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">{reviewCount}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="prose prose-neutral max-w-none text-neutral-600">
        {description ? <div dangerouslySetInnerHTML={{ __html: description }} /> : <p>Đang cập nhật chi tiết sản phẩm.</p>}
      </TabsContent>
      
      <TabsContent value="guide" className="prose prose-neutral max-w-none text-neutral-600">
        {usageGuide ? <div dangerouslySetInnerHTML={{ __html: usageGuide }} /> : <p>Đang cập nhật hướng dẫn sử dụng.</p>}
      </TabsContent>

      <TabsContent value="reviews">
        <div className="py-8 text-center text-neutral-500 border rounded-xl">
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
