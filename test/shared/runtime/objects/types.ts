export interface ProductCardData {
  id: string;
  title: string;
  price: string;
  image?: string;
}

export interface ReviewData {
  author: string;
  rating: number;
  content: string;
}

export interface CartItemData {
  productId: string;
  title: string;
  quantity: number;
  price: string;
}

export interface OrderSummaryData {
  id: string;
  status: string;
  total: string;
  createdAt: string;
}

export interface ArticleSummaryData {
  slug: string;
  title: string;
  excerpt: string;
}

export interface WishlistItemData {
  productId: string;
  title: string;
  votes: number;
}
