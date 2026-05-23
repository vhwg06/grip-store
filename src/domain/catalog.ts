export interface CatalogProduct {
  id: string
  name: string
  description: string | null
  price: string
  compareAtPrice: string | null
  image: string | null
  category: string | null
  isHot: boolean
  isShared: boolean
  purchaseLimit: number | null
  purchaseWarning: string | null
  visibilityLevel: number
  stock: number
  sold: number
  rating: number
  reviewCount: number
}

export interface CatalogProductDetail extends CatalogProduct {}

export interface CatalogCategory {
  id?: number
  name: string
  icon: string | null
  sortOrder: number
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
  page?: number
  limit?: number
  sort?: string
}

export interface CatalogProductViewState {
  product: CatalogProductDetail | null
  requiredLevel?: number | null
}
