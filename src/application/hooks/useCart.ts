"use client";

import { useContext, useState } from "react";
import { CartContext } from "@/application/context/CartContext";
import { submitOrderRequest } from "@/adapters/api/cart.api";
import { CatalogProduct } from "@/domain/catalog";

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const { state, dispatch } = context;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addItem = (product: CatalogProduct, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const clearCart = () => {
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
