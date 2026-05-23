"use client"

import { Button } from "@/components/ui/button"

export function PointsToggle({ enabled, balance, onChange }: { enabled: boolean; balance: number; onChange: (enabled: boolean) => void }) {
  return (
    <Button type="button" variant={enabled ? "default" : "outline"} onClick={() => onChange(!enabled)}>
      {enabled ? "Using" : "Use"} points ({balance})
    </Button>
  )
}
