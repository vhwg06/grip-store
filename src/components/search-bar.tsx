"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

export function SearchBar({ value = "", onSearch, placeholder = "Search" }: { value?: string; onSearch: (value: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value)
  const deferred = useDeferredValue(text)

  useEffect(() => onSearch(deferred), [deferred, onSearch])

  return <Input value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
}
