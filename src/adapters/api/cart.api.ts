import { apiFetch } from "@/adapters/api/http-client";
import { Cart } from "@/domain/cart";

export async function submitOrderRequest(cart: Cart, customerInfo: Record<string, any>) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ cart, customerInfo }),
  });
}
