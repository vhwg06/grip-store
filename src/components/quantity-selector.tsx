"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function QuantitySelector({ value, min = 1, max = 99, onChange }: { value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)))
  return (
    <div className="flex w-32 items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => set(value - 1)}>-</Button>
      <Input className="text-center" value={value} onChange={(event) => set(Number(event.target.value) || min)} />
      <Button type="button" variant="outline" size="sm" onClick={() => set(value + 1)}>+</Button>
    </div>
  )
}
