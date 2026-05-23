"use client"

import { apiFetch } from "@/adapters/api/http-client"
import type {
  OrderActionResult,
  OrderDetail,
  OrderDetailResponse,
  OrdersListResponse,
  OrderSummary,
} from "@/domain/orders"

function normalizeOrderSummary(order: Partial<OrderSummary>): OrderSummary {
  return {
    orderId: String(order.orderId || ""),
    productId: order.productId ?? null,
    productName: String(order.productName || ""),
    amount: String(order.amount || "0"),
    status: order.status ?? "pending",
    createdAt: order.createdAt ?? null,
    canReview: Boolean(order.canReview),
  }
}

function normalizeOrderDetail(order: Partial<OrderDetail>): OrderDetail {
  return {
    ...normalizeOrderSummary(order),
    cardKey: order.cardKey ?? null,
    payee: order.payee ?? null,
    paidAt: order.paidAt ?? null,
  }
}

export async function getMyOrders(page = 1): Promise<OrdersListResponse> {
  const payload = await apiFetch<unknown>(`/api/orders?page=${encodeURIComponent(String(page))}`)
  if (Array.isArray(payload)) {
    return {
      items: payload.map((item) => normalizeOrderSummary(item as OrderSummary)),
      page,
      total: payload.length,
    }
  }

  const value = (payload ?? {}) as Partial<OrdersListResponse> & { orders?: OrderSummary[] }
  const rawItems = Array.isArray(value.items) ? value.items : Array.isArray(value.orders) ? value.orders : []

  return {
    items: rawItems.map((item) => normalizeOrderSummary(item)),
    page: Number(value.page ?? page),
    total: Number(value.total ?? rawItems.length),
  }
}

export async function getOrder(id: string): Promise<OrderDetailResponse> {
  const payload = await apiFetch<unknown>(`/api/orders/${encodeURIComponent(id)}`)
  const value = (payload ?? {}) as Partial<OrderDetailResponse> & Partial<OrderDetail>
  const rawOrder = value.order ?? ("orderId" in value ? value : null)

  return {
    order: rawOrder ? normalizeOrderDetail(rawOrder) : null,
    canViewKey: Boolean(value.canViewKey),
    isOwner: Boolean(value.isOwner),
    refundRequest: value.refundRequest ?? null,
  }
}

export async function checkOrderStatus(id: string): Promise<OrderActionResult> {
  const payload = await apiFetch<Record<string, any>>(`/api/orders/${encodeURIComponent(id)}/status`)
  return {
    success: payload.success !== false && payload.ok !== false,
    status: payload.status,
    error: payload.error,
  }
}

export async function cancelPendingOrder(id: string): Promise<OrderActionResult> {
  const payload = await apiFetch<Record<string, any>>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
  })
  return {
    success: payload.success !== false && payload.ok !== false,
    status: payload.status,
    error: payload.error,
  }
}

export async function submitRefundRequest(id: string, reason: string): Promise<OrderActionResult> {
  const payload = await apiFetch<Record<string, any>>(`/api/orders/${encodeURIComponent(id)}/refund-request`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
  return {
    success: payload.success !== false && payload.ok !== false,
    status: payload.status,
    error: payload.error,
  }
}
