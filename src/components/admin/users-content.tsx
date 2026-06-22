'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { toggleBlock } from "@/adapters/api/admin.api"
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Download,
  History,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  ShieldAlert,
} from "lucide-react"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"

interface User {
  userId: string
  username: string | null
  lastLoginAt: string | Date | null
  createdAt: string | Date | null
  orderCount: number
  isBlocked: boolean
  customerId?: string | null
  email?: string | null
  refundCount?: number
  reviewCount?: number
}

interface UsersContentProps {
  data: {
    items: User[]
    total: number
    page: number
    pageSize: number
  }
  mode?: "customer" | "user"
}

function resolveCustomerQuery(user: User) {
  return user.customerId?.trim() || user.userId?.trim() || user.email?.trim() || user.username?.trim() || ""
}

export function UsersContent({ data, mode = "customer" }: UsersContentProps) {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const blockLock = useRef<string | null>(null)

  useEffect(() => {
    if (data.items.length === 0) {
      setSelectedUser(null)
      return
    }
    const found = data.items.find((user) => user.userId === selectedUser?.userId)
    setSelectedUser(found || data.items[0])
  }, [data.items, selectedUser?.userId])

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const selectedCustomerQuery = selectedUser ? resolveCustomerQuery(selectedUser) : ""

  const metrics = useMemo(() => {
    const blockedCount = data.items.filter((user) => user.isBlocked).length
    const new7d = data.items.filter((user) => {
      if (!user.createdAt) return false
      const created = new Date(user.createdAt)
      if (Number.isNaN(created.getTime())) return false
      return Date.now() - created.getTime() <= 7 * 24 * 60 * 60 * 1000
    }).length
    return {
      total: data.total,
      blockedCount,
      new7d,
    }
  }, [data.items, data.total])

  const selectedUserSignals = useMemo(() => {
    if (!selectedUser) return []
    const signals: Array<{ text: string; badge: string; tone: "danger" | "neutral" | "success" }> = []

    if (selectedUser.isBlocked) {
      signals.push({ text: "Account access is currently restricted.", badge: "Blocked", tone: "danger" })
    }
    if ((selectedUser.refundCount || 0) > 0) {
      signals.push({ text: "Customer has prior refund activity.", badge: "Refunds", tone: "neutral" })
    }
    if ((selectedUser.orderCount || 0) === 0) {
      signals.push({ text: "No commerce history is attached yet.", badge: "New", tone: "neutral" })
    }
    if (signals.length === 0) {
      signals.push({ text: "No active account risks are visible from this page.", badge: "Stable", tone: "success" })
    }

    return signals
  }, [selectedUser])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setIsSearching(true)
    const params = new URLSearchParams(searchParams)
    if (searchTerm) params.set("q", searchTerm)
    else params.delete("q")
    params.set("page", "1")
    router.push(`/admin/${mode === "user" ? "users" : "customers"}?${params.toString()}`)
    setIsSearching(false)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(page))
    router.push(`/admin/${mode === "user" ? "users" : "customers"}?${params.toString()}`)
  }

  const handleToggleBlock = async (user: User) => {
    if (blockLock.current === user.userId) return
    const action = user.isBlocked ? "unblock" : "block"
    if (!confirm(t(`admin.users.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return

    try {
      blockLock.current = user.userId
      setBlockingId(user.userId)
      await toggleBlock(user.userId, !user.isBlocked)
      toast.success(t("common.success"))
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || t("common.error"))
    } finally {
      setBlockingId(null)
      blockLock.current = null
    }
  }

  return (
    <main className="space-y-6 max-w-6xl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium text-[#786f61] mb-1">
            {mode === "user" ? "Admin / Account / Users" : "Admin / Commerce / Users"}
          </div>
          <h1
            data-testid={mode === "user" ? "user-management-title" : "customer-management-title"}
            className="text-3xl font-bold tracking-tight text-[#211e18]"
          >
            {mode === "user" ? "User Management" : "Customer Management"}
          </h1>
          <p className="text-sm text-[#71685a] mt-1">
            {mode === "user"
              ? "Search account email, username, or user ID and control account access from one surface."
              : "Search customers, inspect commerce history, and jump into orders, refunds, reviews, or linked account actions."}
          </p>
        </div>
        {mode !== "user" && (
          <Button
            onClick={() => toast.success("Export started")}
            className="bg-[#99782b] hover:bg-[#856824] text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export customers
          </Button>
        )}
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">
            {mode === "user" ? "Accounts" : "Customers"}
          </span>
          <span className="text-2xl font-bold text-[#211e18]">{metrics.total}</span>
        </div>
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">New 7d</span>
          <span className="text-2xl font-bold text-[#211e18]">{metrics.new7d}</span>
        </div>
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Blocked</span>
          <span className="text-2xl font-bold text-[#211e18]">{metrics.blockedCount}</span>
        </div>
        <div className="bg-[#fffdf8] rounded-lg border border-[#e1d3b7] p-4 flex items-center gap-3 h-[84px] shadow-sm">
          <Info className="h-5 w-5 text-[#99782b] shrink-0" />
          <span className="text-[#7a5a17] text-xs font-medium leading-snug">
            Search, account state, and commerce traces remain visible here. Rewards and card inventory are no longer part of this control surface.
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#71685a]" />
              <Input
                data-testid={mode === "user" ? "user-search-input" : "customer-search-input"}
                placeholder={mode === "user" ? "Search account email, username, or user ID..." : "Search email, phone, user ID..."}
                className="pl-9 bg-[#fbfaf7] border-[#e7e1d7] focus-visible:ring-[#99782b]"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-white border border-[#e7e1d7] text-[#50483d] hover:bg-neutral-50 px-4"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.users.search")}
            </Button>
          </form>

          <section className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {data.items.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#e7e1d7] p-8 text-center text-[#71685a]">
                {t("search.noResults")}
              </div>
            ) : (
              data.items.map((user) => {
                const isSelected = selectedUser?.userId === user.userId
                const displayName = user.username ? getDisplayUsername(user.username, user.userId) : "Anonymous User"
                const profileUrl = user.username ? getExternalProfileUrl(user.username, user.userId) : null

                return (
                  <div
                    key={user.userId}
                    data-testid="user-row"
                    data-user-id={user.userId}
                    onClick={() => setSelectedUser(user)}
                    className={`rounded-lg p-4 border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-[#fffbf5] border-[#99782b] ring-1 ring-[#99782b]"
                        : "bg-white border-[#e7e1d7] hover:border-[#99782b]"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      {profileUrl ? (
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-sm text-[#211e18] hover:underline truncate block"
                        >
                          {displayName}
                        </a>
                      ) : (
                        <span className="font-bold text-sm text-[#211e18] block truncate">{displayName}</span>
                      )}
                      <p className="text-xs text-[#71685a] truncate">
                        {user.email || user.userId} &nbsp;·&nbsp; {user.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>

                    <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <Button
                        size="sm"
                        onClick={() => handleToggleBlock(user)}
                        disabled={blockingId === user.userId}
                        className={`text-xs px-3 h-8 rounded ${
                          user.isBlocked
                            ? "bg-[#c5221f] hover:bg-[#a11b19] text-white"
                            : "bg-[#f3f1ec] border border-[#e2ddd3] text-[#50483d] hover:bg-neutral-100"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </section>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                className="border-[#e7e1d7]"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("search.prev")}
              </Button>
              <div className="flex items-center text-sm text-muted-foreground px-2">
                {t("search.page", { page: data.page, totalPages })}
              </div>
              <Button
                variant="outline"
                className="border-[#e7e1d7]"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= totalPages}
              >
                {t("search.next")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 space-y-6">
          {selectedUser ? (
            <>
              <div
                data-testid={mode === "user" ? "account-actions-panel" : "customer-actions-panel"}
                className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm"
              >
                <div className="border-b border-[#e7e1d7] pb-3">
                  <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider">
                    {mode === "user" ? "Account Actions" : "Customer Actions"}
                  </h2>
                  <p className="text-xs text-[#71685a] mt-1">
                    {mode === "user"
                      ? "Manage account status and open linked customer context. Rewards mutations are removed from this surface."
                      : "Jump into history, refunds, reviews, and linked account actions from one customer context."}
                  </p>
                </div>

                <div className="space-y-2 text-xs border-b border-[#e7e1d7] pb-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Email:</span>
                    <span data-testid="summary-email" className="font-medium text-[#211e18] text-right break-all">
                      {selectedUser.email || "No email"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">{mode === "user" ? "User ID:" : "Customer ID:"}</span>
                    <span
                      data-testid={mode === "user" ? "summary-user-id" : "customer-summary-customer-id"}
                      className="font-mono text-[#211e18] text-right break-all"
                    >
                      {mode === "user" ? selectedUser.userId : (selectedCustomerQuery || selectedUser.userId)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Last Activity:</span>
                    <span data-testid="summary-last-activity" className="font-medium text-[#211e18] text-right">
                      {selectedUser.lastLoginAt ? String(selectedUser.lastLoginAt) : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Blocked State:</span>
                    <span data-testid="summary-blocked-state" className="font-medium text-[#211e18]">
                      {selectedUser.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Order Count:</span>
                    <span data-testid="customer-summary-order-count" className="font-medium text-[#211e18]">
                      {selectedUser.orderCount}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Refund Count:</span>
                    <span data-testid="customer-summary-refund-count" className="font-medium text-[#211e18]">
                      {selectedUser.refundCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#71685a]">Review Count:</span>
                    <span data-testid="customer-summary-review-count" className="font-medium text-[#211e18]">
                      {selectedUser.reviewCount || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    data-testid="account-block-toggle"
                    onClick={() => handleToggleBlock(selectedUser)}
                    disabled={blockingId === selectedUser.userId}
                    className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                  >
                    <Ban className="h-4 w-4 text-[#99782b]" />
                    Block / unblock
                  </Button>

                  <Button
                    onClick={() => router.push(`/admin/orders?q=${encodeURIComponent(selectedCustomerQuery || selectedUser.userId)}`)}
                    className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                  >
                    <History className="h-4 w-4 text-[#99782b]" />
                    Open history
                  </Button>

                  <Button
                    onClick={() => router.push(`/admin/refunds?q=${encodeURIComponent(selectedCustomerQuery || selectedUser.userId)}`)}
                    className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                  >
                    <ShieldAlert className="h-4 w-4 text-[#99782b]" />
                    Open refunds
                  </Button>

                  <Button
                    onClick={() => router.push(`/admin/reviews?q=${encodeURIComponent(selectedCustomerQuery || selectedUser.userId)}`)}
                    className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                  >
                    <MessageSquare className="h-4 w-4 text-[#99782b]" />
                    Open reviews
                  </Button>

                  {mode === "customer" ? (
                    <Button
                      onClick={() => router.push(`/admin/users?q=${encodeURIComponent(selectedUser.username || selectedUser.userId)}`)}
                      className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2] col-span-2"
                    >
                      <Mail className="h-4 w-4 text-[#99782b]" />
                      Open linked account
                    </Button>
                  ) : (
                    <Button
                      data-testid="account-open-customer"
                      onClick={() => router.push(`/admin/customers/?q=${encodeURIComponent(selectedUser.email || selectedUser.userId)}`)}
                      className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2] col-span-2"
                    >
                      <Mail className="h-4 w-4 text-[#99782b]" />
                      Open customer
                    </Button>
                  )}
                </div>

                <div className="text-[10px] text-[#a33b2b] font-semibold text-center mt-2 flex items-center justify-center gap-1.5 bg-[#fff1f0] border border-[#fccfcf] py-1.5 rounded">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Audit note required for risky change</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider border-b border-[#e7e1d7] pb-3">
                  Signals & Risk Indicators
                </h2>
                <div className="space-y-3">
                  {selectedUserSignals.map((signal, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#fafafa] border border-[#e7e1d7] p-3 rounded-lg">
                      <span className="text-xs text-[#71685a] font-medium">{signal.text}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          signal.tone === "danger"
                            ? "bg-[#fce8e6] text-[#c5221f]"
                            : signal.tone === "neutral"
                              ? "bg-[#f1f3f4] text-[#5f6368]"
                              : "bg-[#e6f4ea] text-[#137333]"
                        }`}
                      >
                        {signal.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-[#e7e1d7] p-8 text-center text-[#71685a] h-64 flex items-center justify-center">
              {mode === "user" ? "Select an account to inspect actions and signals." : "Select a customer to inspect actions and signals."}
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}
