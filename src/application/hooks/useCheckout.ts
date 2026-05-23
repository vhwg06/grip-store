"use client"

import {
  createOrder,
  createPaymentOrder,
  getBuyPageMeta,
  getRetryPaymentParams,
  submitPaymentForm,
} from "@/adapters/api/checkout.api"

export function useCheckout() {
  return {
    createOrder,
    createPaymentOrder,
    getBuyPageMeta,
    getRetryPaymentParams,
    submitPaymentForm,
  }
}
