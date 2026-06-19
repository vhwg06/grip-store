export interface CatalogProduct {
  id: string
  name: string
  description: string | null
  price: string
  compareAtPrice: string | null
  image: string | null
  images?: string[]
  category: string | null
  categoryId?: number
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
}

export interface ProductSpecItem {
  key: string
  value: string
}

export interface CatalogProductDetail extends CatalogProduct {
  specs?: ProductSpecItem[]
}


export interface CatalogCategory {
  id?: number
  name: string
  slug?: string
  icon: string | null
  sortOrder: number
  parentId?: number | null
  productCount?: number
}

export interface CatalogSettings {
  shopName: string
  shopDescription: string | null
  shopLogo: string | null
  shopFooter: string | null
  themeColor: string
  noindexEnabled: boolean
  wishlistEnabled: boolean
  checkinEnabled: boolean
  checkinReward: number
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
