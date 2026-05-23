"use client";

import { useFAQ } from "@/application/hooks/useFAQ";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";

export function FAQSection() {
  const { faqs, isLoading } = useFAQ();

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-12 bg-neutral-100 rounded-md"></div>
          <div className="h-12 bg-neutral-100 rounded-md"></div>
          <div className="h-12 bg-neutral-100 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
        <p className="text-neutral-500 max-w-2xl mx-auto">
          Tổng hợp những thắc mắc chung của khách hàng về sản phẩm và dịch vụ tại GRIP.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left font-semibold text-lg py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 prose prose-sm max-w-none pb-4">
                <ReactMarkdown>{faq.answer}</ReactMarkdown>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
