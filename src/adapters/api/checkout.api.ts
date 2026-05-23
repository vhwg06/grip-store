"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type { BuyPageMeta, CheckoutOrderInput, CheckoutPaymentResult, PaymentOrderInput } from "@/domain/checkout"

const EMPTY_BUY_META: BuyPageMeta = {
  reviews: [],
  averageRating: 0,
  reviewCount: 0,
  canReview: false,
  reviewOrderId: undefined,
  emailConfigured: false,
}

function normalizePaymentResult(payload: unknown): CheckoutPaymentResult {
  const value = (payload ?? {}) as Record<string, any>
  const params = value.params ?? value.paymentParams ?? undefined
  const url = value.url ?? value.paymentUrl ?? undefined
  const status = value.status ? String(value.status) : undefined
  const orderId = value.orderId ? String(value.orderId) : undefined

  return {
    success: value.success !== false,
    url,
    params,
    orderId,
    status,
    amount: value.amount ? String(value.amount) : undefined,
    pointsUsed: typeof value.pointsUsed === "number" ? value.pointsUsed : undefined,
    isZeroPrice: Boolean(value.isZeroPrice || status === "delivered" || (!params && orderId)),
    error: value.error ? String(value.error) : undefined,
  }
}

export async function createOrder(input: CheckoutOrderInput) {
  const payload = await apiFetch<unknown>("/api/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      productId: input.productId,
      quantity: input.quantity,
      items: input.items,
      email: input.email,
      name: input.name,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
      paymentMethod: input.paymentMethod,
      usePoints: Boolean(input.usePoints),
    }),
  })

  return normalizePaymentResult(payload)
}

export async function getRetryPaymentParams(orderId: string) {
  const payload = await apiFetch<unknown>(`/api/checkout/orders/${encodeURIComponent(orderId)}/payment-params`)
  return normalizePaymentResult(payload)
}

export async function createPaymentOrder(input: PaymentOrderInput) {
  const payload = await apiFetch<unknown>("/api/checkout/payment-orders", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      payee: input.payee ?? null,
    }),
  })

  return normalizePaymentResult(payload)
}

export async function getBuyPageMeta(productId: string): Promise<BuyPageMeta> {
  if (!productId.trim()) return { ...EMPTY_BUY_META }
  const payload = await apiFetch<Partial<BuyPageMeta>>(
    `/api/catalog/products/${encodeURIComponent(productId)}/buy-meta`,
  )

  return {
    reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
    averageRating: Number(payload.averageRating ?? 0),
    reviewCount: Number(payload.reviewCount ?? payload.reviews?.length ?? 0),
    canReview: Boolean(payload.canReview),
    reviewOrderId: payload.reviewOrderId,
    emailConfigured: Boolean(payload.emailConfigured),
  }
}

export function submitPaymentForm(result: Pick<CheckoutPaymentResult, "url" | "params">) {
  if (!result.url || !result.params) {
    throw new Error("Missing payment parameters")
  }

  const form = document.createElement("form")
  form.method = "POST"
  form.action = result.url

  Object.entries(result.params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = key
    input.value = String(value)
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}
