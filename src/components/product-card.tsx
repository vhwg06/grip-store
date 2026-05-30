import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { StockBadge } from "@/components/stock-badge"
import { buildExportRoutePath } from "@/lib/export-route"

export interface ProductCardData {
  id: string
  name: string
  price: string
  compareAtPrice?: string | null
  image?: string | null
  stock?: number
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] bg-muted">
          {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
        </div>
        <div className="space-y-2 p-4">
          <div className="font-medium line-clamp-2">{product.name}</div>
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
          <StockBadge stock={product.stock ?? 0} />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={buildExportRoutePath("/buy", product.id)}>Buy</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
