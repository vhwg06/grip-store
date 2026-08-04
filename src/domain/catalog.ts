export interface CatalogProduct {
  id: string
  name: string
  description: string | null
  price: string
  compareAtPrice: string | null
  image: string | null
  images?: string[]
  category: string | null
  categoryId?: string | number
  brand?: string
  brandId?: number
  sku?: string
  isHot: boolean
  isNew?: boolean
  isBestSeller?: boolean
  isShared: boolean
  purchaseLimit: number | null
  purchaseWarning: string | null
  visibilityLevel: number
  stock: number
  sold: number
  rating: number
  reviewCount: number
  specs?: ProductSpecItem[]
  usageGuide?: string | null
  bundledGifts?: string | null
  discountPercent?: number
  introArticleId?: string | null
  introArticle?: CatalogLinkedArticle | null
  status?: CatalogProductModelStatus
  warrantySummary?: CatalogWarrantySummary | null
  variantDimensions?: CatalogVariantDimension[]
  variants?: CatalogVariant[]
  selectedVariantId?: string | null
}

export interface ProductSpecItem {
  key: string
  value: string
}

export type CatalogAttributeValueKind = "Scalar" | "Enum" | "Reference"
export type CatalogScalarDataType = "Text" | "Number" | "Boolean"
export type CatalogReferenceTarget = "Material" | "Finish" | "Pack"
export type CatalogMasterKind = "material" | "finish" | "pack"
export type CatalogProductModelStatus = "Draft" | "Active" | "Inactive" | "Discontinued"
export type CatalogVariantStatus = "Active" | "Inactive"

export interface CatalogEnumValue {
  id: string
  key: string
  label: string
  active: boolean
}

export interface CatalogAttributeDefinition {
  id: string
  key: string
  displayName: string
  description: string
  ordering: number
  valueKind: CatalogAttributeValueKind
  dataType?: CatalogScalarDataType
  referenceTarget?: CatalogReferenceTarget
  unitFamily?: string
  unit?: string
  active: boolean
  enumValues: CatalogEnumValue[]
}

export interface CatalogMaster {
  id: string
  kind: CatalogMasterKind
  name: string
  description: string
  swatchMedia: string[]
  sellingUnit?: string
  quantity?: number
  baseUnit?: string
  active: boolean
}

export interface CatalogWarrantySummary {
  term: string
  note?: string
}

export interface CatalogProductImage {
  id: string
  url: string
  ordering: number
  primary: boolean
}

export interface CatalogDimensionValue {
  id: string
  label: string
  active: boolean
}

export interface CatalogVariantDimension {
  id: string
  definitionId: string
  key: string
  allowedValues: CatalogDimensionValue[]
  modelId?: string
}

export interface CatalogMoney {
  amount: number
  currency: string
}

export interface CatalogVariant {
  id: string
  selectedOptions: Record<string, string>
  technicalValues: Record<string, unknown>
  sku: string
  sellingPrice: CatalogMoney | null
  packId: string | null
  status: CatalogVariantStatus
  saleReady: boolean
  canonicalCombination: string
}

export interface CatalogProductModel {
  id: string
  name: string
  categoryId: string
  description: string
  warrantySummary: CatalogWarrantySummary | null
  fixedAttributes: Record<string, unknown>
  fixedPackId: string | null
  measurements: Record<string, unknown>
  status: CatalogProductModelStatus
  images: CatalogProductImage[]
  variantDimensions: CatalogVariantDimension[]
  variants: CatalogVariant[]
  specs: ProductSpecItem[]
}

export interface CatalogAvailableOption {
  key: string
  values: Array<{ id: string; label: string }>
}

export interface CatalogProductDetail extends CatalogProduct {
  specs?: ProductSpecItem[]
}

export interface CatalogLinkedArticle {
  id: string
  title: string
  slug: string
  content: string
  featuredImage?: string | null
}


export interface CatalogCategory {
  id?: string | number
  name: string
  slug?: string
  icon: string | null
  sortOrder: number
  parentId?: string | number | null
  productCount?: number
  active?: boolean
}

export interface CatalogSettings {
  shopName: string
  shopDescription: string | null
  shopLogo: string | null
  shopFooter: string | null
  themeColor: string
  noindexEnabled: boolean
  wishlistEnabled: boolean
  lowStockThreshold: number
  homepageBlocks?: string | null
}

export interface CatalogProductsResponse {
  items: CatalogProduct[]
  page: number
  limit: number
  total: number
}

export interface CatalogSearchParams {
  q?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sort?: string
}

export interface CatalogProductViewState {
  product: CatalogProductDetail | null
  requiredLevel?: number | null
}
