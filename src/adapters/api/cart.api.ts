import { apiFetch } from "@/adapters/api/http-client";
import { Cart } from "@/domain/cart";
import type { CatalogProduct } from "@/domain/catalog";

interface ServerCartItem {
  id: string;
  product_id?: string;
  productId?: string;
  quantity?: number;
  unit_price?: number;
  unitPrice?: number;
  product_snapshot?: Record<string, unknown>;
  productSnapshot?: Record<string, unknown>;
}

interface ServerCart {
  id: string;
  session_id?: string;
  sessionId?: string;
  items?: ServerCartItem[];
}

function normalizeServerProduct(item: ServerCartItem): CatalogProduct {
  const snapshot = (item.product_snapshot ?? item.productSnapshot ?? {}) as Record<string, unknown>;
  const productId = String(item.product_id ?? item.productId ?? snapshot.id ?? "");
  const unitPrice = Number(item.unit_price ?? item.unitPrice ?? snapshot.price ?? 0);
  const name = String(snapshot.name ?? snapshot.title ?? `Product ${productId.slice(0, 8)}`);
  const image = snapshot.image ? String(snapshot.image) : null;

  return {
    id: productId,
    name,
    description: null,
    price: String(Number.isFinite(unitPrice) ? unitPrice : 0),
    compareAtPrice: null,
    image,
    images: image ? [image] : [],
    category: null,
    brand: undefined,
    sku: typeof snapshot.sku === "string" ? snapshot.sku : undefined,
    isHot: false,
    isNew: false,
    isBestSeller: false,
    isShared: false,
    purchaseLimit: null,
    purchaseWarning: null,
    visibilityLevel: -1,
    stock: 0,
    sold: 0,
    rating: 0,
    reviewCount: 0,
    usageGuide: null,
    bundledGifts: null,
    discountPercent: undefined,
  };
}

export function normalizeServerCart(payload: unknown): Cart | null {
  const value = (payload ?? {}) as ServerCart;
  const rawItems = Array.isArray(value.items) ? value.items : [];

  if (rawItems.length === 0) {
    return { items: [], totalQuantity: 0, subtotal: 0 };
  }

  const items = rawItems
    .map((item): Cart["items"][number] | null => {
      const productId = String(item.product_id ?? item.productId ?? "");
      if (!productId) return null;
      const quantity = Math.max(1, Number(item.quantity ?? 1) || 1);
      return {
        id: String(item.id || `${productId}-${Math.random().toString(36).slice(2)}`),
        productId,
        product: normalizeServerProduct(item),
        quantity,
      };
    })
    .filter((item): item is Cart["items"][number] => Boolean(item));

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (Number.parseFloat(String(item.product.price ?? 0)) || 0) * item.quantity,
    0,
  );

  return {
    items,
    totalQuantity,
    subtotal,
  };
}

export async function submitOrderRequest(cart: Cart, customerInfo: Record<string, any>) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ cart, customerInfo }),
  });
}

export async function getServerCart(sessionId: string): Promise<Cart | null> {
  const payload = await apiFetch<unknown>(`/api/cart/${encodeURIComponent(sessionId)}`);
  return normalizeServerCart(payload);
}
