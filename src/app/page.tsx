"use client"

import { useSearchParams } from "next/navigation"
import { useCatalog } from "@/application/hooks/useCatalog"
import { HomeContent } from "@/components/home-content";

const PAGE_SIZE = 24;

function stripMarkdown(input: string): string {
  return input
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[`*_>#+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Home() {
  const searchParams = useSearchParams()
  const q = (searchParams.get("q") || "").trim()
  const categoryParam = (searchParams.get("category") || "").trim()
  const category = categoryParam && categoryParam !== "all" ? categoryParam : ""
  const sort = (searchParams.get("sort") || "default").trim()
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)

  const { products, total, categories: categoryConfig, settings, announcement, isLoading } = useCatalog({
    q,
    category,
    sort,
    page,
    limit: PAGE_SIZE,
  })

  const normalizedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    descriptionPlain: stripMarkdown(product.description || ""),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.image,
    category: product.category,
    stockCount: product.stock,
    soldCount: product.sold,
    isHot: product.isHot,
    rating: product.rating,
    reviewCount: product.reviewCount,
  }))
  const categories = [...new Set(categoryConfig.map((item) => item.name).filter(Boolean))]

  if (isLoading && normalizedProducts.length === 0) {
    return (
      <div className="container py-8 md:py-16 space-y-6">
        <div className="h-8 w-40 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-12 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return <HomeContent
    products={normalizedProducts}
    announcement={announcement}
    visitorCount={undefined}
    categories={categories}
    categoryConfig={categoryConfig}
    pendingOrders={[]}
    wishlistEnabled={Boolean(settings?.wishlistEnabled)}
    filters={{ q, category: category || null, sort }}
    pagination={{ page, pageSize: PAGE_SIZE, total }}
  />;
}
