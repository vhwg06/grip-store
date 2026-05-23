import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

export function StatsCard({ label, value, icon }: { label: ReactNode; value: ReactNode; icon?: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardContent>
    </Card>
  )
}
