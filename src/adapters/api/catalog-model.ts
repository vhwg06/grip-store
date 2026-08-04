import type {
  CatalogAttributeDefinition,
  CatalogAttributeValueKind,
  CatalogAvailableOption,
  CatalogMaster,
  CatalogMasterKind,
  CatalogProduct,
  CatalogProductModel,
  CatalogProductModelStatus,
  CatalogReferenceTarget,
  CatalogScalarDataType,
  CatalogVariant,
  CatalogVariantStatus,
} from "@/domain/catalog"

type UnknownRecord = Record<string, unknown>

function object(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown): string {
  return value == null ? "" : String(value)
}

function optionalText(value: unknown): string | undefined {
  return value == null || value === "" ? undefined : String(value)
}

function nullableText(value: unknown): string | null {
  return value == null || value === "" ? null : String(value)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback
}

export function unwrapCatalogPayload(payload: unknown): unknown {
  const raw = object(payload)
  return raw.data !== undefined ? raw.data : payload
}

export function normalizeCatalogAttributeDefinition(payload: unknown): CatalogAttributeDefinition {
  const raw = object(unwrapCatalogPayload(payload))
  return {
    id: text(raw.id),
    key: text(raw.key),
    displayName: text(raw.displayName ?? raw.display_name ?? raw.key),
    description: text(raw.description),
    ordering: Number(raw.ordering ?? 0),
    valueKind: oneOf<CatalogAttributeValueKind>(raw.valueKind ?? raw.value_kind, ["Scalar", "Enum", "Reference"], "Scalar"),
    dataType: raw.dataType || raw.data_type
      ? oneOf<CatalogScalarDataType>(raw.dataType ?? raw.data_type, ["Text", "Number", "Boolean"], "Text")
      : undefined,
    referenceTarget: raw.referenceTarget || raw.reference_target
      ? oneOf<CatalogReferenceTarget>(raw.referenceTarget ?? raw.reference_target, ["Material", "Finish", "Pack"], "Material")
      : undefined,
    unitFamily: optionalText(raw.unitFamily ?? raw.unit_family),
    unit: optionalText(raw.unit),
    active: raw.active !== false,
    enumValues: array(raw.enumValues ?? raw.enum_values).map((value) => {
      const item = object(value)
      return {
        id: text(item.id),
        key: text(item.key),
        label: text(item.label),
        active: item.active !== false,
      }
    }),
  }
}

export function normalizeCatalogMaster(payload: unknown): CatalogMaster {
  const raw = object(unwrapCatalogPayload(payload))
  return {
    id: text(raw.id),
    kind: oneOf<CatalogMasterKind>(raw.kind, ["material", "finish", "pack"], "material"),
    name: text(raw.name),
    description: text(raw.description),
    swatchMedia: array(raw.swatchMedia ?? raw.swatch_media).map(text).filter(Boolean),
    sellingUnit: optionalText(raw.sellingUnit ?? raw.selling_unit),
    quantity: raw.quantity == null ? undefined : Number(raw.quantity),
    baseUnit: optionalText(raw.baseUnit ?? raw.base_unit),
    active: raw.active !== false,
  }
}

function normalizeVariant(payload: unknown): CatalogVariant {
  const raw = object(payload)
  const price = object(raw.sellingPrice ?? raw.selling_price)
  return {
    id: text(raw.id),
    selectedOptions: Object.fromEntries(
      Object.entries(object(raw.selectedOptions ?? raw.selected_options)).map(([key, value]) => [key, text(value)]),
    ),
    technicalValues: object(raw.technicalValues ?? raw.technical_values),
    sku: text(raw.sku),
    sellingPrice: Object.keys(price).length > 0
      ? { amount: Number(price.amount ?? 0), currency: text(price.currency || "VND") }
      : null,
    packId: nullableText(raw.packId ?? raw.pack_id),
    status: oneOf<CatalogVariantStatus>(raw.status, ["Active", "Inactive"], "Inactive"),
    saleReady: Boolean(raw.saleReady ?? raw.sale_ready),
    canonicalCombination: text(raw.canonicalCombination ?? raw.canonical_combination),
  }
}

export function normalizeCatalogProductModel(payload: unknown): CatalogProductModel {
  const raw = object(unwrapCatalogPayload(payload))
  const warranty = object(raw.warrantySummary ?? raw.warranty_summary)
  return {
    id: text(raw.id),
    name: text(raw.name),
    categoryId: text(raw.categoryId ?? raw.category_id),
    description: text(raw.description),
    warrantySummary: Object.keys(warranty).length > 0
      ? { term: text(warranty.term), note: text(warranty.note) || undefined }
      : null,
    fixedAttributes: object(raw.fixedAttributes ?? raw.fixed_attributes),
    fixedPackId: nullableText(raw.fixedPackId ?? raw.fixed_pack_id),
    measurements: object(raw.measurements),
    status: oneOf<CatalogProductModelStatus>(raw.status, ["Draft", "Active", "Inactive", "Discontinued"], "Draft"),
    images: array(raw.images)
      .map((value) => {
        const item = object(value)
        return {
          id: text(item.id),
          url: text(item.url),
          ordering: Number(item.ordering ?? 0),
          primary: Boolean(item.primary),
        }
      })
      .sort((left, right) => left.ordering - right.ordering),
    variantDimensions: array(raw.variantDimensions ?? raw.variant_dimensions).map((value) => {
      const item = object(value)
      return {
        id: text(item.id),
        definitionId: text(item.definitionId ?? item.definition_id),
        key: text(item.key),
        modelId: text(item.modelId ?? item.model_id) || undefined,
        allowedValues: array(item.allowedValues ?? item.allowed_values).map((allowed) => {
          const option = object(allowed)
          return {
            id: text(option.id),
            label: text(option.label),
            active: option.active !== false,
          }
        }),
      }
    }),
    variants: array(raw.variants).map(normalizeVariant),
    specs: array(raw.specs)
      .map((value) => {
        const item = object(value)
        return { key: text(item.key), value: text(item.value) }
      })
      .filter((item) => item.key && item.value),
  }
}

export function catalogProductFromModel(model: CatalogProductModel): CatalogProduct {
  const publicVariants = model.variants.filter((variant) => variant.saleReady && variant.sellingPrice)
  const firstVariant = [...publicVariants].sort((left, right) =>
    Number(left.sellingPrice?.amount ?? 0) - Number(right.sellingPrice?.amount ?? 0)
  )[0]
  const primaryImage = model.images.find((image) => image.primary) ?? model.images[0]

  return {
    id: model.id,
    name: model.name,
    description: model.description || null,
    price: String(firstVariant?.sellingPrice?.amount ?? 0),
    compareAtPrice: null,
    image: primaryImage?.url ?? null,
    images: model.images.map((image) => image.url),
    category: null,
    categoryId: model.categoryId,
    sku: firstVariant?.sku,
    isHot: false,
    isShared: false,
    purchaseLimit: null,
    purchaseWarning: null,
    visibilityLevel: -1,
    stock: 0,
    sold: 0,
    rating: 0,
    reviewCount: 0,
    specs: model.specs,
    usageGuide: null,
    bundledGifts: null,
    status: model.status,
    warrantySummary: model.warrantySummary,
    variantDimensions: model.variantDimensions,
    variants: model.variants,
    selectedVariantId: firstVariant?.id ?? null,
  }
}

export function normalizeCatalogOptions(payload: unknown): CatalogAvailableOption[] {
  const raw = object(unwrapCatalogPayload(payload))
  return array(raw.options).map((value) => {
    const option = object(value)
    return {
      key: text(option.key),
      values: array(option.values).map((candidate) => {
        const item = object(candidate)
        return { id: text(item.id), label: text(item.label) }
      }),
    }
  })
}

export { normalizeVariant as normalizeCatalogVariant }
