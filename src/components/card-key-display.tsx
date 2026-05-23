"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CardKeyDisplay({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false)
  const display = revealed ? value : value.replace(/.(?=.{4})/g, "*")
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3 font-mono text-sm">
      <span className="flex-1 break-all">{display}</span>
      <Button size="sm" variant="outline" onClick={() => setRevealed((next) => !next)}>{revealed ? "Hide" : "Reveal"}</Button>
      <Button size="sm" onClick={() => void navigator.clipboard?.writeText(value)}>Copy</Button>
    </div>
  )
}
