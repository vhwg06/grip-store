"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Boxes, ImageIcon, Plus, Ruler, Save, ShieldCheck, Tags } from "lucide-react"
import { toast } from "sonner"
import {
  createCatalogVariant,
  createCatalogVariantDimension,
  replaceCatalogProductMedia,
  saveCatalogProductModel,
  transitionCatalogProductModel,
  transitionCatalogVariant,
} from "@/adapters/api/admin.api"
import MediaUploader from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  CatalogAttributeDefinition,
  CatalogCategory,
  CatalogMaster,
  CatalogProductModel,
} from "@/domain/catalog"
import { buildExportRoutePath } from "@/lib/export-route"

interface ProductFormProps {
  model?: CatalogProductModel | null
  categories: CatalogCategory[]
  definitions: CatalogAttributeDefinition[]
  masters: Record<"material" | "finish" | "pack", CatalogMaster[]>
  isCreate?: boolean
  onChanged?: () => Promise<unknown>
}

type MeasurementRow = { key: string; value: string; unit: string }

function rawValue(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "object" && !Array.isArray(value)) {
    return String((value as Record<string, unknown>).value ?? "")
  }
  return String(value)
}

function initialAttributeInputs(model: CatalogProductModel | null | undefined, definitions: CatalogAttributeDefinition[]) {
  return Object.fromEntries(definitions.map((definition) => {
    const stored = rawValue(assignedAttributeValue(model, definition))
    if (definition.valueKind !== "Enum") return [definition.id, stored]
    const selected = definition.enumValues.find((option) =>
      option.id === stored
      || option.key.toLowerCase() === stored.toLowerCase()
      || option.label.toLowerCase() === stored.toLowerCase()
    )
    return [definition.id, selected?.id ?? stored]
  }))
}

function initialMeasurements(model: CatalogProductModel | null | undefined): MeasurementRow[] {
  return Object.entries(model?.measurements ?? {}).map(([key, raw]) => {
    const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : { value: raw }
    return { key, value: String(value.value ?? ""), unit: String(value.unit ?? "") }
  })
}

function assignedAttributeValue(model: CatalogProductModel | null | undefined, definition: CatalogAttributeDefinition): unknown {
  return model?.fixedAttributes[definition.id]
    ?? model?.fixedAttributes[definition.key]
    ?? model?.fixedAttributes[definition.displayName]
}

function slugValue(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function ProductForm({ model, categories, definitions, masters, isCreate = false, onChanged }: ProductFormProps) {
  const router = useRouter()
  const [name, setName] = useState(model?.name ?? "")
  const [categoryId, setCategoryId] = useState(model?.categoryId ?? "")
  const [description, setDescription] = useState(model?.description ?? "")
  const [warrantyTerm, setWarrantyTerm] = useState(model?.warrantySummary?.term ?? "")
  const [warrantyNote, setWarrantyNote] = useState(model?.warrantySummary?.note ?? "")
  const [attributeInputs, setAttributeInputs] = useState<Record<string, string>>(() => initialAttributeInputs(model, definitions))
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(() => initialMeasurements(model))
  const [primaryImage, setPrimaryImage] = useState(model?.images.find((image) => image.primary)?.url ?? "")
  const [galleryImages, setGalleryImages] = useState(model?.images.filter((image) => !image.primary).map((image) => image.url) ?? [])
  const [saving, setSaving] = useState(false)
  const [mediaSaving, setMediaSaving] = useState(false)
  const [dimensionDefinitionId, setDimensionDefinitionId] = useState("")
  const [dimensionValues, setDimensionValues] = useState("")
  const [dimensionSelectedValues, setDimensionSelectedValues] = useState<string[]>([])
  const [variantSelection, setVariantSelection] = useState<Record<string, string>>({})
  const [variantSku, setVariantSku] = useState("")
  const [variantPrice, setVariantPrice] = useState("")
  const [variantPackId, setVariantPackId] = useState("")
  const [catalogBusy, setCatalogBusy] = useState(false)

  useEffect(() => {
    setName(model?.name ?? "")
    setCategoryId(model?.categoryId ?? "")
    setDescription(model?.description ?? "")
    setWarrantyTerm(model?.warrantySummary?.term ?? "")
    setWarrantyNote(model?.warrantySummary?.note ?? "")
    setAttributeInputs(initialAttributeInputs(model, definitions))
    setMeasurements(initialMeasurements(model))
    setPrimaryImage(model?.images.find((image) => image.primary)?.url ?? "")
    setGalleryImages(model?.images.filter((image) => !image.primary).map((image) => image.url) ?? [])
  }, [definitions, model])

  const dimensionDefinitionIds = useMemo(
    () => new Set(model?.variantDimensions.map((dimension) => dimension.definitionId) ?? []),
    [model?.variantDimensions],
  )
  const fixedDefinitions = definitions.filter((definition) =>
    !dimensionDefinitionIds.has(definition.id)
    && (definition.active || assignedAttributeValue(model, definition) != null)
  )
  const dimensionCandidates = definitions.filter((definition) => definition.active && !dimensionDefinitionIds.has(definition.id))
  const selectedDimensionDefinition = dimensionCandidates.find((definition) => definition.id === dimensionDefinitionId)
  const dimensionVocabulary = (() => {
    if (selectedDimensionDefinition?.valueKind === "Enum") {
      return selectedDimensionDefinition.enumValues
        .filter((value) => value.active)
        .map((value) => ({ id: value.id, label: value.label }))
    }
    if (selectedDimensionDefinition?.valueKind === "Reference") {
      const kind = selectedDimensionDefinition.referenceTarget?.toLowerCase() as "material" | "finish" | "pack" | undefined
      return kind
        ? masters[kind].filter((value) => value.active).map((value) => ({ id: value.id, label: value.name }))
        : []
    }
    return []
  })()
  const hasHistoricalAssignments = fixedDefinitions.some((definition) => {
    const value = attributeInputs[definition.id]?.trim()
    if (!value) return false
    if (!definition.active) return true
    if (definition.valueKind === "Enum") {
      return definition.enumValues.some((option) => option.id === value && !option.active)
    }
    if (definition.valueKind === "Reference") {
      const kind = definition.referenceTarget?.toLowerCase() as "material" | "finish" | "pack" | undefined
      return Boolean(kind && masters[kind].some((option) => option.id === value && !option.active))
    }
    return false
  })

  const fixedAttributes = () => Object.fromEntries(
    fixedDefinitions.flatMap((definition): Array<[string, unknown]> => {
        const value = attributeInputs[definition.id]?.trim() ?? ""
        if (!value) return []
        if (definition.valueKind === "Scalar" && definition.dataType === "Boolean") {
          return [[definition.id, value === "true"]]
        }
        if (definition.valueKind === "Scalar" && definition.dataType === "Number") {
          return [[definition.id, { value: Number(value), unit: definition.unit }]]
        }
        return [[definition.id, value]]
      }),
  )

  const measurementPayload = () => Object.fromEntries(
    measurements
      .filter((measurement) => measurement.key.trim() && measurement.value.trim())
      .map((measurement) => [measurement.key.trim(), { value: Number(measurement.value), unit: measurement.unit.trim() }]),
  )

  const refresh = async () => {
    if (onChanged) await onChanged()
    router.refresh()
  }

  const saveModel = async () => {
    setSaving(true)
    try {
      const saved = await saveCatalogProductModel({
        id: model?.id,
        name: name.trim(),
        categoryId,
        description: description.trim(),
        ...(!hasHistoricalAssignments ? { fixedAttributes: fixedAttributes() } : {}),
        measurements: measurementPayload(),
        warrantySummary: warrantyTerm.trim() ? { term: warrantyTerm.trim(), note: warrantyNote.trim() } : null,
      })
      toast.success(isCreate ? "ProductModel draft created" : "ProductModel saved")
      if (isCreate) {
        router.push(buildExportRoutePath("/admin/product/edit", saved.id))
      } else {
        await refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save ProductModel")
    } finally {
      setSaving(false)
    }
  }

  const saveMedia = async () => {
    if (!model) return
    setMediaSaving(true)
    try {
      const images = [
        ...(primaryImage ? [{ url: primaryImage, ordering: 1, primary: true }] : []),
        ...galleryImages.filter(Boolean).map((url, index) => ({ url, ordering: index + 2, primary: false })),
      ]
      await replaceCatalogProductMedia(model.id, images)
      toast.success("ProductModel media saved")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save ProductModel media")
    } finally {
      setMediaSaving(false)
    }
  }

  const addDimension = async () => {
    if (!model || !dimensionDefinitionId) return
    const allowedValues = selectedDimensionDefinition?.valueKind === "Enum" || selectedDimensionDefinition?.valueKind === "Reference"
      ? dimensionVocabulary
          .filter((value) => dimensionSelectedValues.includes(value.id))
          .map((value) => ({ ...value, active: true }))
      : dimensionValues.split("\n").map((label) => label.trim()).filter(Boolean).map((label) => ({ id: slugValue(label), label, active: true }))
    if (allowedValues.length === 0) return
    setCatalogBusy(true)
    try {
      await createCatalogVariantDimension(model.id, { definitionId: dimensionDefinitionId, allowedValues })
      setDimensionDefinitionId("")
      setDimensionValues("")
      setDimensionSelectedValues([])
      toast.success("Variant dimension added")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add VariantDimension")
    } finally {
      setCatalogBusy(false)
    }
  }

  const addVariant = async () => {
    if (!model || !variantSku.trim() || Number(variantPrice) <= 0) return
    if (model.variantDimensions.some((dimension) => !variantSelection[dimension.key])) return
    setCatalogBusy(true)
    try {
      await createCatalogVariant(model.id, {
        selectedOptions: variantSelection,
        sku: variantSku.trim(),
        sellingPrice: { amount: Number(variantPrice), currency: "VND" },
        ...(variantPackId ? { packId: variantPackId } : {}),
      })
      setVariantSku("")
      setVariantPrice("")
      setVariantPackId("")
      setVariantSelection({})
      toast.success("Variant created")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create Variant")
    } finally {
      setCatalogBusy(false)
    }
  }

  const transitionModel = async (action: "publish" | "unpublish" | "discontinue") => {
    if (!model) return
    setCatalogBusy(true)
    try {
      await transitionCatalogProductModel(model.id, action)
      toast.success(`ProductModel ${action} completed`)
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not ${action} ProductModel`)
    } finally {
      setCatalogBusy(false)
    }
  }

  const transitionVariant = async (variantId: string, action: "activate" | "inactivate") => {
    setCatalogBusy(true)
    try {
      await transitionCatalogVariant(variantId, action)
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not ${action} Variant`)
    } finally {
      setCatalogBusy(false)
    }
  }

  return (
    <div className="w-full max-w-[1120px] space-y-7 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#99782b]">Admin / Catalog / ProductModels</p>
          <div className="flex items-center gap-3"><h1 className="text-3xl font-bold tracking-tight text-[#211e18]">{isCreate ? "Create ProductModel" : model?.name}</h1>{model && <StatusBadge status={model.status} />}</div>
          <p className="mt-2 text-sm text-[#71685a]">Catalog content and commercial metadata stay separate from stock, warehouse, orders, and warranty claims.</p>
        </div>
        <div className="flex gap-2">
          {model?.status === "Active" && <Button asChild variant="outline"><Link href={`/products/${model.id}`}>View public detail</Link></Button>}
          <Button data-testid="save-btn" disabled={saving || !name.trim() || !categoryId} onClick={saveModel} className="bg-[#99782b] text-white hover:bg-[#856824]"><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : isCreate ? "Create draft" : "Save model"}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Section title="Product definition" icon={<Tags className="h-4 w-4" />} description="Identity, classification, content, and warranty summary owned by ProductModel.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input data-testid="field-title" value={name} onChange={(event) => setName(event.target.value)} /></Field>
              <Field label="Category">
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select active category</option>
                  {categories.filter((category) => category.active !== false || String(category.id) === model?.categoryId).map((category) => <option key={String(category.id)} value={String(category.id)}>{category.name}{category.active === false ? " (inactive)" : ""}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2"><Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} /></Field></div>
              <Field label="Warranty term"><Input value={warrantyTerm} onChange={(event) => setWarrantyTerm(event.target.value)} placeholder="24 tháng" /></Field>
              <Field label="Warranty note"><Input value={warrantyNote} onChange={(event) => setWarrantyNote(event.target.value)} placeholder="Optional catalog note" /></Field>
            </div>
          </Section>

          <Section title="Fixed specifications" icon={<Ruler className="h-4 w-4" />} description="Values use active typed definitions. Definition IDs remain the stored identity; labels are resolved by the backend detail projection.">
            {hasHistoricalAssignments && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">This ProductModel uses deactivated catalog vocabulary. Its historical fixed specifications stay readable and are left unchanged when the rest of the model is saved.</div>}
            {fixedDefinitions.length > 0 ? <div data-testid="admin-specs-inputs" className="grid gap-4 sm:grid-cols-2">
              {fixedDefinitions.map((definition) => <AttributeInput key={definition.id} definition={definition} value={attributeInputs[definition.id] ?? ""} masters={masters} disabled={hasHistoricalAssignments} onChange={(value) => setAttributeInputs((current) => ({ ...current, [definition.id]: value }))} />)}
            </div> : <EmptyHint href="/admin/attributes" text="Create an active AttributeDefinition before assigning fixed specifications." />}
          </Section>

          <Section title="Measurements" icon={<Ruler className="h-4 w-4" />} description="Measurements are submitted with value and unit; the backend validates and canonicalizes compatible units.">
            <div className="space-y-3">
              {measurements.map((measurement, index) => (
                <div key={`${measurement.key}-${index}`} className="grid grid-cols-[1fr_1fr_100px_36px] gap-2">
                  <Input value={measurement.key} onChange={(event) => setMeasurements((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, key: event.target.value } : row))} placeholder="overallLength" />
                  <Input type="number" value={measurement.value} onChange={(event) => setMeasurements((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, value: event.target.value } : row))} placeholder="200" />
                  <Input value={measurement.unit} onChange={(event) => setMeasurements((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, unit: event.target.value } : row))} placeholder="mm" />
                  <Button variant="ghost" size="sm" onClick={() => setMeasurements((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}>×</Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setMeasurements((rows) => [...rows, { key: "", value: "", unit: "" }])}><Plus className="mr-2 h-4 w-4" /> Add measurement</Button>
            </div>
          </Section>

          {model && <Section title="Variant configuration" icon={<Boxes className="h-4 w-4" />} description="Dimensions define allowed options; Variants own exact combinations, SKU, current SellingPrice, and Pack reference.">
            <div className="space-y-5">
              <div className="rounded-lg border border-[#eee8de] p-4">
                <h3 className="text-sm font-bold text-[#211e18]">Dimensions</h3>
                <div className="mt-3 space-y-2">{model.variantDimensions.map((dimension) => <div key={dimension.id} className="flex items-center justify-between rounded-md bg-[#fbfaf7] px-3 py-2 text-xs"><span className="font-semibold">{dimension.key}</span><span className="text-[#71685a]">{dimension.allowedValues.filter((value) => value.active).map((value) => value.label).join(" · ")}</span></div>)}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr_auto]">
                  <select value={dimensionDefinitionId} onChange={(event) => { setDimensionDefinitionId(event.target.value); setDimensionSelectedValues([]); setDimensionValues("") }} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"><option value="">Choose definition</option>{dimensionCandidates.map((definition) => <option key={definition.id} value={definition.id}>{definition.displayName}</option>)}</select>
                  {selectedDimensionDefinition?.valueKind === "Enum" || selectedDimensionDefinition?.valueKind === "Reference" ? (
                    <div className="flex min-h-10 flex-wrap gap-2 rounded-md border border-input p-2">
                      {dimensionVocabulary.map((value) => <button key={value.id} type="button" onClick={() => setDimensionSelectedValues((current) => current.includes(value.id) ? current.filter((id) => id !== value.id) : [...current, value.id])} className={`rounded-md border px-2 py-1 text-xs font-semibold ${dimensionSelectedValues.includes(value.id) ? "border-[#99782b] bg-[#fff3d4] text-[#6f5317]" : "border-[#ded8cd] text-[#71685a]"}`}>{value.label}</button>)}
                      {dimensionVocabulary.length === 0 && <span className="text-xs text-[#8c8274]">No active vocabulary values.</span>}
                    </div>
                  ) : <Textarea value={dimensionValues} onChange={(event) => setDimensionValues(event.target.value)} rows={2} placeholder={"One allowed value per line\n200 mm"} />}
                  <Button variant="outline" disabled={catalogBusy || !dimensionDefinitionId || ((selectedDimensionDefinition?.valueKind === "Enum" || selectedDimensionDefinition?.valueKind === "Reference") ? dimensionSelectedValues.length === 0 : !dimensionValues.trim())} onClick={addDimension}>Add</Button>
                </div>
              </div>

              {model.variantDimensions.length > 0 && <div className="rounded-lg border border-[#eee8de] p-4">
                <h3 className="text-sm font-bold text-[#211e18]">Create exact Variant</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {model.variantDimensions.map((dimension) => <Field key={dimension.id} label={dimension.key}><select value={variantSelection[dimension.key] ?? ""} onChange={(event) => setVariantSelection((current) => ({ ...current, [dimension.key]: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="">Select</option>{dimension.allowedValues.filter((value) => value.active).map((value) => <option key={value.id} value={value.label}>{value.label}</option>)}</select></Field>)}
                  <Field label="SKU"><Input value={variantSku} onChange={(event) => setVariantSku(event.target.value)} /></Field>
                  <Field label="Selling price (VND)"><Input type="number" min="1" value={variantPrice} onChange={(event) => setVariantPrice(event.target.value)} /></Field>
                  <Field label="Pack (optional)"><select value={variantPackId} onChange={(event) => setVariantPackId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="">No Pack</option>{masters.pack.filter((pack) => pack.active).map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}</select></Field>
                </div>
                <Button className="mt-4 bg-[#99782b] text-white hover:bg-[#856824]" disabled={catalogBusy || !variantSku.trim() || Number(variantPrice) <= 0} onClick={addVariant}>Create Variant</Button>
              </div>}

              <div className="space-y-2">{model.variants.map((variant) => <div key={variant.id} className="flex flex-col gap-3 rounded-lg border border-[#eee8de] p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="text-sm font-bold">{variant.sku || "No SKU"}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${variant.saleReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{variant.saleReady ? "Sale-ready" : variant.status}</span></div><p className="mt-1 text-xs text-[#71685a]">{Object.entries(variant.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(" · ")} · {variant.sellingPrice ? `${variant.sellingPrice.amount.toLocaleString("vi-VN")} ${variant.sellingPrice.currency}` : "No price"}</p></div><Button size="sm" variant="outline" disabled={catalogBusy} onClick={() => transitionVariant(variant.id, variant.status === "Active" ? "inactivate" : "activate")}>{variant.status === "Active" ? "Inactivate" : "Activate"}</Button></div>)}</div>
            </div>
          </Section>}
        </div>

        <aside className="space-y-5">
          <Section title="Media" icon={<ImageIcon className="h-4 w-4" />} description="Exactly one primary model image is required for publication.">
            <div className="space-y-5">
              <MediaUploader value={primaryImage} onChange={(value) => setPrimaryImage(String(value))} label="Primary image" />
              <MediaUploader value={galleryImages} onChange={(value) => setGalleryImages(Array.isArray(value) ? value : [value])} multiple maxFiles={8} label="Gallery" />
              <Button className="w-full" variant="outline" disabled={!model || mediaSaving} onClick={saveMedia}>{mediaSaving ? "Saving media…" : "Save media"}</Button>
            </div>
          </Section>

          {model && <Section title="Publication" icon={<ShieldCheck className="h-4 w-4" />} description="The backend checks lifecycle and universal publication invariants.">
            <div className="space-y-2">
              <Check label="Primary image" ready={model.images.filter((image) => image.primary).length === 1} />
              <Check label="Sale-ready Variant" ready={model.variants.some((variant) => variant.saleReady)} />
              <Check label="Category" ready={Boolean(model.categoryId)} />
            </div>
            <div className="mt-4 grid gap-2">
              {(model.status === "Draft" || model.status === "Inactive") && <Button disabled={catalogBusy} onClick={() => transitionModel("publish")} className="bg-[#99782b] text-white hover:bg-[#856824]">Publish</Button>}
              {model.status === "Active" && <Button disabled={catalogBusy} variant="outline" onClick={() => transitionModel("unpublish")}>Unpublish before structural edits</Button>}
              {model.status !== "Discontinued" && <Button disabled={catalogBusy} variant="ghost" className="text-red-600" onClick={() => transitionModel("discontinue")}>Discontinue</Button>}
            </div>
          </Section>}
        </aside>
      </div>
    </div>
  )
}

function AttributeInput({ definition, value, masters, disabled, onChange }: { definition: CatalogAttributeDefinition; value: string; masters: Record<"material" | "finish" | "pack", CatalogMaster[]>; disabled?: boolean; onChange: (value: string) => void }) {
  const description = [definition.valueKind, definition.dataType, definition.unit, definition.active ? null : "inactive definition"].filter(Boolean).join(" · ")
  const referenceKind = definition.referenceTarget?.toLowerCase() as "material" | "finish" | "pack" | undefined
  return <Field label={definition.displayName} hint={description}>
    {definition.valueKind === "Enum" ? <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="">Not set</option>{definition.enumValues.filter((option) => option.active || option.id === value).map((option) => <option key={option.id} value={option.id}>{option.label}{option.active ? "" : " (inactive)"}</option>)}</select>
      : definition.valueKind === "Reference" ? <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="">Not set</option>{(referenceKind ? masters[referenceKind] : []).filter((option) => option.active || option.id === value).map((option) => <option key={option.id} value={option.id}>{option.name}{option.active ? "" : " (inactive)"}</option>)}</select>
      : definition.dataType === "Boolean" ? <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></select>
      : <div className="relative"><Input disabled={disabled} type={definition.dataType === "Number" ? "number" : "text"} value={value} onChange={(event) => onChange(event.target.value)} />{definition.unit && <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#807667]">{definition.unit}</span>}</div>}
  </Field>
}

function Section({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-xl border border-[#e7e1d7] bg-white p-5"><div className="mb-5 flex items-start gap-3"><div className="rounded-lg bg-[#f3ead4] p-2 text-[#99782b]">{icon}</div><div><h2 className="text-base font-bold text-[#211e18]">{title}</h2><p className="mt-1 text-xs leading-relaxed text-[#807667]">{description}</p></div></div>{children}</section>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-1.5"><div className="flex items-center justify-between gap-2"><Label className="text-xs font-semibold text-[#50483d]">{label}</Label>{hint && <span className="text-[10px] text-[#9a9184]">{hint}</span>}</div>{children}</div>
}

function Check({ label, ready }: { label: string; ready: boolean }) {
  return <div className="flex items-center justify-between rounded-md bg-[#fbfaf7] px-3 py-2 text-xs"><span className="text-[#71685a]">{label}</span><span className={`font-bold ${ready ? "text-emerald-700" : "text-amber-700"}`}>{ready ? "Ready" : "Missing"}</span></div>
}

function EmptyHint({ href, text }: { href: string; text: string }) {
  return <div className="rounded-lg border border-dashed border-[#d8c8a4] bg-[#fffaf0] p-5 text-center text-xs text-[#6f5317]">{text}<Link href={href} className="mt-2 block font-bold underline">Open Catalog Data</Link></div>
}

function StatusBadge({ status }: { status: CatalogProductModel["status"] }) {
  return <span className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[11px] font-bold text-[#5f5649]">{status}</span>
}
