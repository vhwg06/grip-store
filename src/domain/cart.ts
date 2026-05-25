import { CatalogProduct } from "./catalog";

export interface CartItem {
  id: string; // e.g. cart item unique id
  productId: string;
  product: CatalogProduct;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: { product: CatalogProduct; quantity: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "HYDRATE"; payload: Cart }
  | { type: "CLEAR_CART" };
