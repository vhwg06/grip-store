"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { BookOpen, Database, FolderTree, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import {
  addCatalogEnumValue,
  deactivateCatalogAttributeDefinition,
  deactivateCatalogCategory,
  deactivateCatalogEnumValue,
  deactivateCatalogMaster,
  saveCatalogAttributeDefinition,
  saveCatalogCategory,
  saveCatalogMaster,
} from "@/adapters/api/admin.api"
import { useCatalogAttributeDefinitions, useCatalogCategories, useCatalogMasters } from "@/application/hooks/useAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  CatalogAttributeDefinition,
  CatalogAttributeValueKind,
  CatalogCategory,
  CatalogMaster,
  CatalogMasterKind,
  CatalogReferenceTarget,
  CatalogScalarDataType,
} from "@/domain/catalog"

const emptyDefinition = {
  key: "",
  displayName: "",
  description: "",
  ordering: "0",
  valueKind: "Scalar" as CatalogAttributeValueKind,
  dataType: "Text" as CatalogScalarDataType,
  referenceTarget: "Material" as CatalogReferenceTarget,
  unitFamily: "",
  unit: "",
}

export function CatalogDataContent() {
  const definitions = useCatalogAttributeDefinitions()
  const [selected, setSelected] = useState<CatalogAttributeDefinition | null>(null)
  const [definitionForm, setDefinitionForm] = useState(emptyDefinition)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [enumKey, setEnumKey] = useState("")
  const [enumLabel, setEnumLabel] = useState("")

  useEffect(() => {
    if (!selected) {
      setDefinitionForm(emptyDefinition)
      return
    }
    setDefinitionForm({
      key: selected.key,
      displayName: selected.displayName,
      description: selected.description,
      ordering: String(selected.ordering),
      valueKind: selected.valueKind,
      dataType: selected.dataType ?? "Text",
      referenceTarget: selected.referenceTarget ?? "Material",
      unitFamily: selected.unitFamily ?? "",
      unit: selected.unit ?? "",
    })
  }, [selected])

  const filteredDefinitions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return definitions.data ?? []
    return (definitions.data ?? []).filter((definition) =>
      `${definition.key} ${definition.displayName} ${definition.valueKind}`.toLowerCase().includes(query)
    )
  }, [definitions.data, search])

  const saveDefinition = async () => {
    setSaving(true)
    try {
      const semantic = definitionForm.valueKind === "Scalar"
        ? {
            dataType: definitionForm.dataType,
            unitFamily: definitionForm.dataType === "Number" ? definitionForm.unitFamily || undefined : undefined,
            unit: definitionForm.dataType === "Number" ? definitionForm.unit || undefined : undefined,
          }
        : definitionForm.valueKind === "Reference"
          ? { referenceTarget: definitionForm.referenceTarget }
          : {}
      const saved = await saveCatalogAttributeDefinition({
        id: selected?.id,
        key: definitionForm.key.trim(),
        displayName: definitionForm.displayName.trim(),
        description: definitionForm.description.trim(),
        ordering: Number(definitionForm.ordering || 0),
        valueKind: definitionForm.valueKind,
        ...semantic,
      })
      toast.success(selected ? "Attribute metadata saved" : "Attribute definition created")
      await definitions.mutate()
      setSelected(saved)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save attribute definition")
    } finally {
      setSaving(false)
    }
  }

  const deactivateDefinition = async () => {
    if (!selected || !confirm(`Deactivate ${selected.displayName}? Existing product values stay readable.`)) return
    try {
      await deactivateCatalogAttributeDefinition(selected.id)
      toast.success("Attribute definition deactivated")
      setSelected(null)
      await definitions.mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not deactivate attribute definition")
    }
  }

  const addEnum = async () => {
    if (!selected || !enumKey.trim() || !enumLabel.trim()) return
    try {
      await addCatalogEnumValue(selected.id, { key: enumKey.trim(), label: enumLabel.trim() })
      setEnumKey("")
      setEnumLabel("")
      const fresh = await definitions.mutate()
      setSelected(fresh?.find((definition) => definition.id === selected.id) ?? selected)
      toast.success("Enum value added")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add enum value")
    }
  }

  const deactivateEnum = async (valueId: string) => {
    if (!selected) return
    try {
      await deactivateCatalogEnumValue(selected.id, valueId)
      const fresh = await definitions.mutate()
      setSelected(fresh?.find((definition) => definition.id === selected.id) ?? selected)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not deactivate enum value")
    }
  }

  return (
    <div className="w-full max-w-[1120px] space-y-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#99782b]">Admin / Catalog</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">Catalog vocabulary</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#71685a]">
            Define typed product specifications and maintain Material, Finish, and Pack references without rewriting historical product data.
          </p>
        </div>
        <Button onClick={() => setSelected(null)} className="bg-[#99782b] text-white hover:bg-[#856824]">
          <Plus className="mr-2 h-4 w-4" /> New definition
        </Button>
      </div>

      <CategoryDataSection />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-xl border border-[#e7e1d7] bg-white">
          <div className="flex items-center gap-3 border-b border-[#eee8de] p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9a9184]" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search key, label, or type" className="pl-9" />
            </div>
            <span className="text-xs font-medium text-[#71685a]">{filteredDefinitions.length} definitions</span>
          </div>
          <div data-testid="catalog-attribute-table" className="max-h-[680px] divide-y divide-[#f0ebe1] overflow-auto">
            {filteredDefinitions.map((definition) => (
              <button
                key={definition.id}
                type="button"
                onClick={() => setSelected(definition)}
                className={`flex w-full items-center justify-between gap-4 p-4 text-left transition-colors ${selected?.id === definition.id ? "bg-[#fff9eb]" : "hover:bg-[#fbfaf7]"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-[#211e18]">{definition.displayName}</span>
                    {!definition.active && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">Inactive</span>}
                  </div>
                  <p className="mt-1 truncate font-mono text-[11px] text-[#8c8274]">{definition.key}</p>
                </div>
                <span className="shrink-0 rounded-md bg-[#f3f1ec] px-2 py-1 text-[11px] font-semibold text-[#645a4c]">
                  {definition.valueKind}{definition.dataType ? ` · ${definition.dataType}` : ""}
                </span>
              </button>
            ))}
            {!definitions.isLoading && filteredDefinitions.length === 0 && (
              <div className="p-10 text-center text-sm text-[#8c8274]">No attribute definitions found.</div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#e7e1d7] bg-white p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#211e18]">{selected ? "Edit definition" : "Create definition"}</h2>
              <p className="mt-1 text-xs text-[#807667]">Semantic fields become immutable after the definition is used.</p>
            </div>
            {selected && <Button variant="ghost" size="sm" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stable key">
              <Input value={definitionForm.key} disabled={Boolean(selected)} onChange={(event) => setDefinitionForm((form) => ({ ...form, key: event.target.value }))} placeholder="overall_length" />
            </Field>
            <Field label="Display name">
              <Input value={definitionForm.displayName} onChange={(event) => setDefinitionForm((form) => ({ ...form, displayName: event.target.value }))} placeholder="Overall length" />
            </Field>
            <Field label="Value kind">
              <select value={definitionForm.valueKind} onChange={(event) => setDefinitionForm((form) => ({ ...form, valueKind: event.target.value as CatalogAttributeValueKind }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="Scalar">Scalar</option>
                <option value="Enum">Enum</option>
                <option value="Reference">Reference</option>
              </select>
            </Field>
            <Field label="Ordering">
              <Input type="number" value={definitionForm.ordering} onChange={(event) => setDefinitionForm((form) => ({ ...form, ordering: event.target.value }))} />
            </Field>
            {definitionForm.valueKind === "Scalar" && (
              <>
                <Field label="Data type">
                  <select value={definitionForm.dataType} onChange={(event) => setDefinitionForm((form) => ({ ...form, dataType: event.target.value as CatalogScalarDataType }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                  </select>
                </Field>
                {definitionForm.dataType === "Number" && (
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                    <Field label="Unit family"><Input value={definitionForm.unitFamily} onChange={(event) => setDefinitionForm((form) => ({ ...form, unitFamily: event.target.value }))} placeholder="length" /></Field>
                    <Field label="Canonical unit"><Input value={definitionForm.unit} onChange={(event) => setDefinitionForm((form) => ({ ...form, unit: event.target.value }))} placeholder="mm" /></Field>
                  </div>
                )}
              </>
            )}
            {definitionForm.valueKind === "Reference" && (
              <Field label="Reference target">
                <select value={definitionForm.referenceTarget} onChange={(event) => setDefinitionForm((form) => ({ ...form, referenceTarget: event.target.value as CatalogReferenceTarget }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="Material">Material</option>
                  <option value="Finish">Finish</option>
                  <option value="Pack">Pack</option>
                </select>
              </Field>
            )}
            <div className="sm:col-span-2"><Field label="Description"><Textarea value={definitionForm.description} onChange={(event) => setDefinitionForm((form) => ({ ...form, description: event.target.value }))} rows={3} /></Field></div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#eee8de] pt-4">
            <Button variant="outline" disabled={!selected || selected.active === false} onClick={deactivateDefinition}>Deactivate</Button>
            <Button disabled={saving || !definitionForm.key.trim() || !definitionForm.displayName.trim()} onClick={saveDefinition} className="bg-[#99782b] text-white hover:bg-[#856824]">
              {saving ? "Saving…" : "Save definition"}
            </Button>
          </div>

          {selected?.valueKind === "Enum" && (
            <div className="mt-6 border-t border-[#eee8de] pt-5">
              <h3 className="text-sm font-bold text-[#211e18]">Selectable values</h3>
              <div className="mt-3 flex gap-2">
                <Input value={enumKey} onChange={(event) => setEnumKey(event.target.value)} placeholder="stable-key" />
                <Input value={enumLabel} onChange={(event) => setEnumLabel(event.target.value)} placeholder="Display label" />
                <Button onClick={addEnum} variant="outline">Add</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.enumValues.map((value) => (
                  <span key={value.id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${value.active ? "border-[#ded4c1] bg-[#fffaf0] text-[#5c4a27]" : "border-neutral-200 bg-neutral-50 text-neutral-400"}`}>
                    {value.label}
                    {value.active && <button type="button" onClick={() => deactivateEnum(value.id)} aria-label={`Deactivate ${value.label}`}><X className="h-3 w-3" /></button>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <MasterDataSection />
    </div>
  )
}

function CategoryDataSection() {
  const categories = useCatalogCategories()
  const [selected, setSelected] = useState<CatalogCategory | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [parentId, setParentId] = useState("")
  const [position, setPosition] = useState("0")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(selected?.name ?? "")
    setSlug(selected?.slug ?? "")
    setParentId(selected?.parentId == null ? "" : String(selected.parentId))
    setPosition(String(selected?.sortOrder ?? 0))
  }, [selected])

  const save = async () => {
    setSaving(true)
    try {
      const saved = await saveCatalogCategory({
        id: selected?.id == null ? undefined : String(selected.id),
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId || null,
        position: Number(position || 0),
        active: selected?.active ?? true,
      })
      await categories.mutate()
      setSelected(saved)
      toast.success(selected ? "Category saved" : "Category created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save category")
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async () => {
    if (!selected?.id || !confirm(`Deactivate ${selected.name}? Existing ProductModels keep their category history.`)) return
    try {
      await deactivateCatalogCategory(String(selected.id))
      await categories.mutate()
      setSelected(null)
      toast.success("Category deactivated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not deactivate category")
    }
  }

  return (
    <section className="rounded-xl border border-[#e7e1d7] bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#f3ead4] p-2 text-[#99782b]"><FolderTree className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-bold text-[#211e18]">Product categories</h2><p className="text-xs text-[#807667]">Active categories are available when creating ProductModels.</p></div>
      </div>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {(categories.data ?? []).map((category) => (
            <button key={String(category.id)} type="button" onClick={() => setSelected(category)} className={`rounded-lg border p-4 text-left ${selected?.id === category.id ? "border-[#b89a55] bg-[#fffaf0]" : "border-[#e7e1d7]"}`}>
              <div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-[#211e18]">{category.name}</span><span className={`h-2 w-2 rounded-full ${category.active ? "bg-emerald-500" : "bg-neutral-300"}`} /></div>
              <p className="mt-1 truncate font-mono text-[11px] text-[#8c8274]">{category.slug}</p>
            </button>
          ))}
          <button type="button" onClick={() => setSelected(null)} className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-[#cdbb93] text-sm font-semibold text-[#8a6a23]"><Plus className="mr-2 h-4 w-4" /> New category</button>
        </div>
        <div className="space-y-3 rounded-lg border border-[#eee8de] bg-[#fbfaf7] p-4">
          <h3 className="text-sm font-bold text-[#211e18]">{selected ? "Edit category" : "Create category"}</h3>
          <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
          <Field label="Slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="door-handles" /></Field>
          <Field label="Parent">
            <select value={parentId} onChange={(event) => setParentId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="">No parent</option>{(categories.data ?? []).filter((category) => category.active && category.id !== selected?.id).map((category) => <option key={String(category.id)} value={String(category.id)}>{category.name}</option>)}</select>
          </Field>
          <Field label="Position"><Input type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} /></Field>
          <div className="flex gap-2"><Button variant="outline" disabled={!selected?.active} onClick={deactivate}>Deactivate</Button><Button onClick={save} disabled={saving || !name.trim() || !slug.trim()} className="flex-1 bg-[#99782b] text-white hover:bg-[#856824]">{saving ? "Saving…" : "Save category"}</Button></div>
        </div>
      </div>
    </section>
  )
}

function MasterDataSection() {
  const [kind, setKind] = useState<CatalogMasterKind>("material")
  const masters = useCatalogMasters(kind)
  const [selected, setSelected] = useState<CatalogMaster | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sellingUnit, setSellingUnit] = useState("")
  const [quantity, setQuantity] = useState("")
  const [baseUnit, setBaseUnit] = useState("")
  const [swatchMedia, setSwatchMedia] = useState("")

  useEffect(() => {
    setSelected(null)
  }, [kind])

  useEffect(() => {
    setName(selected?.name ?? "")
    setDescription(selected?.description ?? "")
    setSellingUnit(selected?.sellingUnit ?? "")
    setQuantity(selected?.quantity == null ? "" : String(selected.quantity))
    setBaseUnit(selected?.baseUnit ?? "")
    setSwatchMedia(selected?.swatchMedia.join("\n") ?? "")
  }, [selected])

  const save = async () => {
    try {
      await saveCatalogMaster(kind, {
        id: selected?.id,
        name: name.trim(),
        description: description.trim(),
        ...(kind === "finish" ? { swatchMedia: swatchMedia.split("\n").map((value) => value.trim()).filter(Boolean) } : {}),
        ...(kind === "pack" ? { sellingUnit: sellingUnit.trim(), quantity: Number(quantity), baseUnit: baseUnit.trim() } : {}),
      })
      await masters.mutate()
      setSelected(null)
      toast.success(`${kind} saved`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not save ${kind}`)
    }
  }

  const deactivate = async (master: CatalogMaster) => {
    try {
      await deactivateCatalogMaster(kind, master.id)
      await masters.mutate()
      if (selected?.id === master.id) setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not deactivate ${kind}`)
    }
  }

  return (
    <section className="rounded-xl border border-[#e7e1d7] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#f3ead4] p-2 text-[#99782b]"><Database className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-bold text-[#211e18]">Reference masters</h2><p className="text-xs text-[#807667]">Canonical values used by Reference attributes.</p></div>
        </div>
        <div className="flex rounded-lg bg-[#f3f1ec] p-1">
          {(["material", "finish", "pack"] as CatalogMasterKind[]).map((value) => (
            <button key={value} type="button" onClick={() => setKind(value)} className={`rounded-md px-4 py-1.5 text-xs font-semibold capitalize ${kind === value ? "bg-white text-[#6f5317] shadow-sm" : "text-[#71685a]"}`}>{value}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(masters.data ?? []).map((master) => (
            <div key={master.id} className={`rounded-lg border p-4 ${selected?.id === master.id ? "border-[#b89a55] bg-[#fffaf0]" : "border-[#e7e1d7]"}`}>
              <button type="button" onClick={() => setSelected(master)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3"><span className="text-sm font-bold text-[#211e18]">{master.name}</span><span className={`h-2 w-2 rounded-full ${master.active ? "bg-emerald-500" : "bg-neutral-300"}`} /></div>
                <p className="mt-2 line-clamp-2 text-xs text-[#807667]">{master.description || "No description"}</p>
              </button>
              {master.active && <button type="button" onClick={() => void deactivate(master)} className="mt-3 text-[11px] font-semibold text-red-600">Deactivate</button>}
            </div>
          ))}
          <button type="button" onClick={() => setSelected(null)} className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-[#cdbb93] text-sm font-semibold text-[#8a6a23]"><Plus className="mr-2 h-4 w-4" /> New {kind}</button>
        </div>
        <div className="space-y-3 rounded-lg border border-[#eee8de] bg-[#fbfaf7] p-4">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#99782b]" /><h3 className="text-sm font-bold capitalize text-[#211e18]">{selected ? `Edit ${kind}` : `Create ${kind}`}</h3></div>
          <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
          <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} /></Field>
          {kind === "finish" && <Field label="Swatch media URLs"><Textarea value={swatchMedia} onChange={(event) => setSwatchMedia(event.target.value)} rows={3} placeholder="One URL per line" /></Field>}
          {kind === "pack" && <div className="grid grid-cols-3 gap-2"><Field label="Selling unit"><Input value={sellingUnit} onChange={(event) => setSellingUnit(event.target.value)} /></Field><Field label="Quantity"><Input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field><Field label="Base unit"><Input value={baseUnit} onChange={(event) => setBaseUnit(event.target.value)} /></Field></div>}
          <Button onClick={save} disabled={!name.trim() || (kind === "pack" && (!sellingUnit.trim() || !baseUnit.trim() || Number(quantity) <= 0))} className="w-full bg-[#99782b] text-white hover:bg-[#856824]">Save {kind}</Button>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-semibold text-[#50483d]">{label}</Label>{children}</div>
}
