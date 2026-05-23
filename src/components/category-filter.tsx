"use client"

import { Button } from "@/components/ui/button"

export function CategoryFilter({ categories, value, onChange }: { categories: string[]; value?: string | null; onChange: (category: string | null) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button variant={!value ? "default" : "outline"} size="sm" onClick={() => onChange(null)}>All</Button>
      {categories.map((category) => (
        <Button key={category} variant={value === category ? "default" : "outline"} size="sm" onClick={() => onChange(category)}>
          {category}
        </Button>
      ))}
    </div>
  )
}
