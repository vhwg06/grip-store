"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Eye, ImageOff, Search, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { transitionCatalogProductModel } from "@/adapters/api/admin.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CatalogProductModel, CatalogProductModelStatus } from "@/domain/catalog"
import { buildExportRoutePath } from "@/lib/export-route"

interface AdminProductsContentProps {
  products: CatalogProductModel[]
  onChanged: () => Promise<unknown>
}

const statuses: Array<CatalogProductModelStatus | "All"> = ["All", "Draft", "Active", "Inactive", "Discontinued"]

export function AdminProductsContent({ products, onChanged }: AdminProductsContentProps) {
  const [status, setStatus] = useState<CatalogProductModelStatus | "All">("All")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "")
  const [busyId, setBusyId] = useState("")

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesStatus = status === "All" || product.status === status
      const matchesQuery = !search || product.name.toLowerCase().includes(search) || product.id.toLowerCase().includes(search)
      return matchesStatus && matchesQuery
    })
  }, [products, query, status])
  const selected = products.find((product) => product.id === selectedId) ?? filtered[0] ?? null
  const counts = Object.fromEntries(statuses.map((value) => [value, value === "All" ? products.length : products.filter((product) => product.status === value).length]))

  const transition = async (product: CatalogProductModel, action: "publish" | "unpublish" | "discontinue") => {
    if (busyId) return
    if (action === "discontinue" && !confirm(`Discontinue ${product.name}? This transition is terminal.`)) return
    setBusyId(product.id)
    try {
      await transitionCatalogProductModel(product.id, action)
      toast.success(`${product.name} ${action === "publish" ? "published" : action === "unpublish" ? "unpublished" : "discontinued"}`)
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not ${action} ProductModel`)
    } finally {
      setBusyId("")
    }
  }

  return (
    <div className="w-full max-w-[1120px] space-y-7 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#99782b]">Admin / Catalog</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">ProductModel management</h1>
          <p className="mt-2 text-sm text-[#71685a]">Author product content, typed specifications, variants, media, and publication lifecycle.</p>
        </div>
        <Button asChild data-testid="create-btn" className="bg-[#99782b] text-white hover:bg-[#856824]">
          <Link href="/admin/product/new">Create ProductModel</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {statuses.map((value) => (
          <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-xl border p-4 text-left transition-colors ${status === value ? "border-[#b89a55] bg-[#fffaf0]" : "border-[#e7e1d7] bg-white hover:bg-[#fbfaf7]"}`}>
            <span className="block text-xs font-semibold text-[#71685a]">{value}</span>
            <span className="mt-2 block text-2xl font-bold text-[#211e18]">{counts[value]}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-xl border border-[#e7e1d7] bg-white">
          <div className="relative border-b border-[#eee8de] p-4">
            <Search className="absolute left-7 top-6.5 h-4 w-4 text-[#9a9184]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ProductModel" className="pl-9" />
          </div>
          {filtered.length > 0 ? (
            <div data-testid="admin-table" className="divide-y divide-[#f0ebe1]">
              {filtered.map((product) => {
                const primary = product.images.find((image) => image.primary) ?? product.images[0]
                const readyVariants = product.variants.filter((variant) => variant.saleReady).length
                return (
                  <div key={product.id} data-item-id={product.id} className={`flex w-full items-center gap-4 p-4 transition-colors ${selected?.id === product.id ? "bg-[#fffaf0]" : "hover:bg-[#fbfaf7]"}`}>
                    <button type="button" onClick={() => setSelectedId(product.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f3f1ec]">
                        {primary?.url ? <img src={primary.url} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-[#aaa092]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><h2 className="truncate text-sm font-bold text-[#211e18]">{product.name}</h2><StatusBadge status={product.status} /></div>
                        <p className="mt-1 truncate font-mono text-[10px] text-[#958b7d]">{product.id}</p>
                        <p className="mt-2 text-xs text-[#71685a]">{product.specs.length} specs · {product.variantDimensions.length} dimensions · {readyVariants} sale-ready variants</p>
                      </div>
                    </button>
                    <Button asChild variant="outline" size="sm" data-testid="edit-btn" onClick={(event) => event.stopPropagation()}>
                      <Link href={buildExportRoutePath("/admin/product/edit", product.id)}>Edit</Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div data-testid="admin-table-empty" className="p-14 text-center text-sm text-[#71685a]">No ProductModels match this filter.</div>
          )}
        </section>

        <aside className="space-y-4">
          {selected ? (
            <>
              <div className="rounded-xl border border-[#e7e1d7] bg-white p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#99782b]">Selected model</p><h2 className="mt-2 text-lg font-bold text-[#211e18]">{selected.name}</h2></div><StatusBadge status={selected.status} /></div>
                <dl className="mt-5 grid grid-cols-2 gap-y-3 border-t border-[#eee8de] pt-4 text-xs">
                  <dt className="text-[#807667]">Primary image</dt><dd className="text-right font-semibold">{selected.images.some((image) => image.primary) ? "Ready" : "Missing"}</dd>
                  <dt className="text-[#807667]">Sale-ready variants</dt><dd className="text-right font-semibold">{selected.variants.filter((variant) => variant.saleReady).length}</dd>
                  <dt className="text-[#807667]">Specifications</dt><dd className="text-right font-semibold">{selected.specs.length}</dd>
                </dl>
                <div className="mt-5 grid gap-2">
                  <Button asChild className="bg-[#99782b] text-white hover:bg-[#856824]"><Link href={buildExportRoutePath("/admin/product/edit", selected.id)}>Open editor</Link></Button>
                  {selected.status === "Draft" || selected.status === "Inactive" ? <Button variant="outline" disabled={busyId === selected.id} onClick={() => transition(selected, "publish")}>Publish</Button> : null}
                  {selected.status === "Active" ? <Button variant="outline" disabled={busyId === selected.id} onClick={() => transition(selected, "unpublish")}>Unpublish</Button> : null}
                  {selected.status !== "Discontinued" ? <Button variant="ghost" className="text-red-600 hover:text-red-700" disabled={busyId === selected.id} onClick={() => transition(selected, "discontinue")}>Discontinue</Button> : null}
                </div>
              </div>
              <div className="rounded-xl border border-[#e1d3b7] bg-[#fffaf0] p-5 text-xs leading-relaxed text-[#6f5317]">
                <div className="mb-2 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" /> Publication is backend-owned</div>
                Publish remains blocked until exactly one primary image and at least one sale-ready Variant are persisted.
              </div>
              {selected.status === "Active" && <Button asChild variant="outline" className="w-full"><Link href={`/products/${selected.id}`}><Eye className="mr-2 h-4 w-4" /> View public detail</Link></Button>}
            </>
          ) : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-[#807667]">Select a ProductModel.</div>}
        </aside>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: CatalogProductModelStatus }) {
  const className = status === "Active" ? "bg-emerald-50 text-emerald-700" : status === "Draft" ? "bg-amber-50 text-amber-700" : status === "Discontinued" ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${className}`}>{status}</span>
}
