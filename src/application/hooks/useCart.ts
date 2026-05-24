"use client";

import { useContext, useState } from "react";
import { CartContext } from "@/application/context/CartContext";
import { submitOrderRequest } from "@/adapters/api/cart.api";
import { CatalogProduct } from "@/domain/catalog";
import type { Cart } from "@/domain/cart";

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const { state, dispatch } = context;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const persistCartSnapshot = (next: Cart) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "grip-cart",
      JSON.stringify(next, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
  };

  const calculateTotals = (items: Cart["items"]): Cart => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + (Number.parseFloat(String(item.product?.price ?? 0)) || 0) * item.quantity,
      0
    );
    return { items, totalQuantity, subtotal };
  };

  const addItem = (product: CatalogProduct, quantity = 1) => {
    const existingIdx = state.items.findIndex((item) => item.productId === product.id);
    const nextItems = [...state.items];
    if (existingIdx >= 0) {
      nextItems[existingIdx] = {
        ...nextItems[existingIdx],
        quantity: Math.max(1, nextItems[existingIdx].quantity + quantity),
      };
    } else {
      nextItems.push({
        id: Math.random().toString(36).slice(2),
        productId: product.id,
        product,
        quantity: Math.max(1, quantity),
      });
    }
    persistCartSnapshot(calculateTotals(nextItems));
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const nextItems = state.items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    persistCartSnapshot(calculateTotals(nextItems));
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const removeItem = (productId: string) => {
    const nextItems = state.items.filter((item) => item.productId !== productId);
    persistCartSnapshot(calculateTotals(nextItems));
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const clearCart = () => {
    persistCartSnapshot({ items: [], totalQuantity: 0, subtotal: 0 });
    dispatch({ type: "CLEAR_CART" });
  };

  const submitOrder = async (customerInfo: Record<string, any>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await submitOrderRequest(state, customerInfo);
      clearCart();
      setIsSubmitting(false);
      return response;
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err : new Error("Failed to submit order"));
      throw err;
    }
  };

  return {
    cart: state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    submitOrder,
    isSubmitting,
    error,
  };
}
