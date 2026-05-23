import { cn } from "@/lib/utils"

export function PriceDisplay({ price, compareAtPrice, className }: { price: string | number; compareAtPrice?: string | number | null; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-semibold">{price}</span>
      {compareAtPrice && <span className="text-sm text-muted-foreground line-through">{compareAtPrice}</span>}
    </div>
  )
}
