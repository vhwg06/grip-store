import { cn } from "@/lib/utils"

export function CheckinStreak({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className={cn("h-2.5 w-6 rounded-full", index < Math.min(days, 7) ? "bg-amber-500" : "bg-muted")}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{days} days</span>
    </div>
  )
}
