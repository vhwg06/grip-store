"use client"

import { useSearchParams } from "next/navigation"
import { useSearch } from "@/application/hooks/useSearch"
import { SearchContent } from "@/components/search-content"

function parseIntParam(value: unknown, fallback: number) {
  const num = typeof value === 'string' ? Number.parseInt(value, 10) : NaN
  return Number.isFinite(num) && num > 0 ? num : fallback
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = (searchParams.get("q") || "").trim()
  const category = (searchParams.get("category") || "all").trim()
  const sort = (searchParams.get("sort") || "default").trim()
  const page = parseIntParam(searchParams.get("page"), 1)
  const pageSize = Math.min(parseIntParam(searchParams.get("pageSize"), 24), 60)

  const { products, categories, total, isLoading } = useSearch({
    q,
    category,
    sort,
    page,
    limit: pageSize,
  })

  if (isLoading && products.length === 0) {
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

  return (
    <SearchContent
      q={q}
      category={category}
      sort={sort}
      page={page}
      pageSize={pageSize}
      total={total}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        image: product.image,
        category: product.category,
        isHot: product.isHot ?? false,
        stockCount: product.stock,
        soldCount: product.sold,
      }))}
      categories={categories.map((categoryItem) => ({ name: categoryItem.name, icon: categoryItem.icon, sortOrder: categoryItem.sortOrder }))}
    />
  )
}
