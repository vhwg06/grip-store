"use client";

import React, { createContext, useReducer, useEffect, useContext } from "react";
import { Cart, CartAction } from "@/domain/cart";

const initialState: Cart = {
  items: [],
  totalQuantity: 0,
  subtotal: 0,
};

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.product.id
      );

      let newItems = [...state.items];
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems.push({
          id: Math.random().toString(36).substring(7),
          productId: action.payload.product.id,
          product: action.payload.product,
          quantity: action.payload.quantity,
        });
      }

      return calculateCartTotals(newItems);
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return calculateCartTotals(newItems);
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.productId !== action.payload.productId
      );
      return calculateCartTotals(newItems);
    }
    case "CLEAR_CART": {
      return initialState;
    }
    default:
      return state;
  }
}

function calculateCartTotals(items: Cart['items']): Cart {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return { items, totalQuantity, subtotal };
}

interface CartContextType {
  state: Cart;
  dispatch: React.Dispatch<CartAction>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("grip-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Simple hydrate, you might want to dispatch an init action instead
        parsed.items.forEach((item: any) => {
          dispatch({ type: "ADD_ITEM", payload: { product: item.product, quantity: item.quantity } });
        });
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("grip-cart", JSON.stringify(state));
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
