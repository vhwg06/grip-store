import { ProductCard, type ProductCardData } from "@/components/product-card"

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
