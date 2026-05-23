import { cn } from "@/lib/utils"

export function LoadingSkeleton({ variant = "full-page", className }: { variant?: "card" | "list-item" | "full-page"; className?: string }) {
  if (variant === "card") {
    return <div className={cn("h-56 rounded-2xl bg-muted/40 animate-pulse", className)} />
  }
  if (variant === "list-item") {
    return <div className={cn("h-20 rounded-xl bg-muted/40 animate-pulse", className)} />
  }
  return (
    <div className={cn("space-y-4", className)}>
      <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
      <div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
    </div>
  )
}
