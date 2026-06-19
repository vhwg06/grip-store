'use client'

import { useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { approveReview, hideReview, featureReview, bulkPublishReviews, deleteReview } from "@/adapters/api/admin.api"
import { Star, ShieldCheck, AlertTriangle, ExternalLink, Image as ImageIcon, CheckCircle, EyeOff, LayoutGrid } from "lucide-react"

interface ReviewRow {
  id: number
  product_id?: string
  productId?: string
  product_name?: string
  productName?: string
  order_id?: string
  orderId?: string
  user_id?: string
  userId?: string
  username: string
  rating: number
  comment: string | null
  status: string
  attachments?: string[]
  is_verified_purchase?: boolean
  isVerifiedPurchase?: boolean
  flagged_reason?: string | null
  flaggedReason?: string | null
  created_at?: string
  createdAt?: string | Date
}

interface Stats {
  pending: number
  featured: number
  hidden: number
}

export function AdminReviewsContent({ reviews: initialReviews, stats }: { reviews: ReviewRow[], stats: Stats }) {
  const { t } = useI18n()
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews)
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(initialReviews[0] || null)
  const [checkedIds, setCheckedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase()
    const pName = r.product_name ?? r.productName ?? ""
    const comment = r.comment ?? ""
    const username = r.username ?? ""
    const userId = r.user_id ?? r.userId ?? ""
    return (
      pName.toLowerCase().includes(q) ||
      comment.toLowerCase().includes(q) ||
      username.toLowerCase().includes(q) ||
      userId.toLowerCase().includes(q)
    )
  })

  // Handle checking / unchecking
  const handleCheck = (id: number, checked: boolean) => {
    if (checked) {
      setCheckedIds((prev) => [...prev, id])
    } else {
      setCheckedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const handleApprove = async (r: ReviewRow) => {
    setActionLoading(true)
    try {
      await approveReview(r.id)
      setReviews((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: "APPROVED" } : item))
      )
      if (selectedReview?.id === r.id) {
        setSelectedReview((prev) => prev ? { ...prev, status: "APPROVED" } : null)
      }
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to approve review")
    } finally {
      setActionLoading(false)
    }
  }

  const handleHide = async (r: ReviewRow) => {
    setActionLoading(true)
    try {
      await hideReview(r.id)
      setReviews((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: "HIDDEN" } : item))
      )
      if (selectedReview?.id === r.id) {
        setSelectedReview((prev) => prev ? { ...prev, status: "HIDDEN" } : null)
      }
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to hide review")
    } finally {
      setActionLoading(false)
    }
  }

  const handleFeature = async (r: ReviewRow) => {
    setActionLoading(true)
    const willFeature = r.status !== "FEATURED"
    try {
      await featureReview(r.id, willFeature)
      const nextStatus = willFeature ? "FEATURED" : "APPROVED"
      setReviews((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: nextStatus } : item))
      )
      if (selectedReview?.id === r.id) {
        setSelectedReview((prev) => prev ? { ...prev, status: nextStatus } : null)
      }
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to feature review")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (r: ReviewRow) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return
    setActionLoading(true)
    try {
      await deleteReview(r.id)
      setReviews((prev) => prev.filter((item) => item.id !== r.id))
      if (selectedReview?.id === r.id) {
        setSelectedReview(reviews.find((item) => item.id !== r.id) || null)
      }
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to delete review")
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkPublish = async () => {
    if (checkedIds.length === 0) return
    setLoading(true)
    try {
      await bulkPublishReviews(checkedIds)
      setReviews((prev) =>
        prev.map((item) =>
          checkedIds.includes(item.id) ? { ...item, status: "APPROVED" } : item
        )
      )
      if (selectedReview && checkedIds.includes(selectedReview.id)) {
        setSelectedReview((prev) => prev ? { ...prev, status: "APPROVED" } : null)
      }
      setCheckedIds([])
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message || "Failed to bulk publish")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[1056px] space-y-6">
      {/* Page Title to satisfy Figma contract */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
          <span>Admin</span>
          <span>/</span>
          <span>Commerce</span>
          <span>/</span>
          <span className="text-foreground font-medium">Reviews</span>
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy mt-[57px] leading-none">
          Review Moderation
        </h1>
        <p className="text-sm text-[#71685a] mt-[12px]">
          Moderate product reviews, highlight high-signal feedback, and quarantine suspicious or abusive content.
        </p>
      </div>

      {/* Header Search and Action controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-[36px]">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by product, user or comment..."
            className="w-full md:w-[360px] bg-white border-[#e7e1d7] rounded-lg"
          />
          <Button
            data-testid="reviews-bulk-publish-btn"
            onClick={handleBulkPublish}
            disabled={loading || checkedIds.length === 0}
            className="shrink-0 bg-[#99782b] hover:bg-[#99782b]/90 text-white rounded-lg text-xs font-semibold h-8"
          >
            {loading ? "Publishing..." : `Publish Selected (${checkedIds.length})`}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="reviews-stats-pending" className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-700 dark:text-amber-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card data-testid="reviews-stats-featured" className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-indigo-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-500">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-indigo-700 dark:text-indigo-500">{stats.featured}</div>
            <p className="text-xs text-muted-foreground mt-1">Shown prominently on product pages</p>
          </CardContent>
        </Card>

        <Card data-testid="reviews-stats-hidden" className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-neutral-500/5 to-neutral-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-500">Hidden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-neutral-700 dark:text-neutral-500">{stats.hidden}</div>
            <p className="text-xs text-muted-foreground mt-1">Archived or blocked reviews</p>
          </CardContent>
        </Card>

        <Card data-testid="reviews-stats-alert" className="border-destructive/30 shadow-sm relative overflow-hidden bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-destructive/95 leading-relaxed">
              Moderation needs image context before publish.
            </div>
            <p className="text-xs text-muted-foreground mt-1">Please review attachments</p>
          </CardContent>
        </Card>
      </div>

      {/* Split Moderation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Queue Panel */}
        <div data-testid="reviews-queue-container" className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 mb-2">
              <span className="text-sm font-bold text-foreground">Review Queue</span>
              <span className="text-xs text-muted-foreground">{filteredReviews.length} reviews matching filters</span>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No reviews found</div>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredReviews.map((r) => {
                  const pName = r.product_name ?? r.productName ?? "Unknown Product"
                  const pId = r.product_id ?? r.productId ?? ""
                  const isVerified = r.is_verified_purchase ?? r.isVerifiedPurchase ?? false
                  const flagReason = r.flagged_reason ?? r.flaggedReason ?? null
                  const isSelected = selectedReview?.id === r.id

                  return (
                    <div
                      key={r.id}
                      data-testid="review-queue-item"
                      onClick={() => setSelectedReview(r)}
                      className={`group flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          data-testid="review-item-checkbox"
                          checked={checkedIds.includes(r.id)}
                          onCheckedChange={(checked) => handleCheck(r.id, !!checked)}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm text-foreground truncate">{r.username}</span>
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">ID: {r.id}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center text-amber-500 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? "fill-amber-500" : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>

                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-border">
                            {r.status}
                          </Badge>

                          {isVerified && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-500/10 text-green-600 border-none flex items-center gap-0.5 shrink-0">
                              <ShieldCheck className="w-3 h-3 text-green-600" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm font-medium text-foreground truncate mt-1">{pName}</p>

                        {r.comment && (
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">
                            "{r.comment}"
                          </p>
                        )}

                        {flagReason && (
                          <div className="flex items-center gap-1 text-[11px] text-destructive font-medium bg-destructive/5 px-2 py-0.5 rounded mt-1.5 w-fit">
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                            <span>Warning: {flagReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Detail Context Card */}
          <Card data-testid="reviews-context-panel" className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-muted/10">
              <CardTitle className="text-base font-bold font-svn-gilroy">Context</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {selectedReview ? (
                <>
                  {/* Product Info */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Product link</span>
                    <a
                      data-testid="context-product-link"
                      href={`/products/${selectedReview.product_id ?? selectedReview.productId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-primary hover:underline flex items-center gap-1 w-fit"
                    >
                      {selectedReview.product_name ?? selectedReview.productName ?? "Unknown Product"}
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-primary" />
                    </a>
                  </div>

                  {/* Buyer Profile */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Buyer profile</span>
                    <div data-testid="context-buyer-profile" className="flex items-center gap-2 bg-muted/30 p-2.5 rounded-lg border">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{selectedReview.username}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">User ID: {selectedReview.user_id ?? selectedReview.userId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Order ID</span>
                    <p data-testid="context-order-id" className="text-sm font-bold text-foreground font-mono">
                      {selectedReview.order_id ?? selectedReview.orderId ?? "N/A"}
                    </p>
                  </div>

                  {/* Rating & Status */}
                  <div className="flex items-center justify-between bg-muted/10 p-2.5 rounded-lg border">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedReview.rating ? "fill-amber-500" : "text-neutral-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-foreground ml-1.5">{selectedReview.rating}/5</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                      {selectedReview.status}
                    </Badge>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Comment</span>
                    <div className="text-sm text-foreground bg-muted/20 p-3 rounded-lg border min-h-[64px] whitespace-pre-wrap break-words leading-relaxed">
                      {selectedReview.comment || <span className="text-muted-foreground italic">No written comment provided.</span>}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image Preview</span>
                      <span data-testid="context-attachment-count" className="text-xs font-bold text-foreground">
                        {selectedReview.attachments?.length || 0} files
                      </span>
                    </div>

                    {selectedReview.attachments && selectedReview.attachments.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedReview.attachments.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="aspect-square relative rounded-lg border bg-muted/40 hover:opacity-90 transition-opacity overflow-hidden flex items-center justify-center group"
                          >
                            <img src={url} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border text-center">
                        No image or video attachments.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground italic">
                  Select a review from the queue to view its details.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Panel Card */}
          <Card data-testid="reviews-action-panel" className="border-border/60 shadow-sm bg-muted/5">
            <CardHeader className="border-b pb-3.5">
              <CardTitle className="text-base font-bold font-svn-gilroy">Moderation</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
              <Button
                data-testid="review-action-approve"
                variant="default"
                onClick={() => selectedReview && handleApprove(selectedReview)}
                disabled={actionLoading || !selectedReview || selectedReview.status === "APPROVED"}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Approve
              </Button>
              <Button
                data-testid="review-action-feature"
                variant="outline"
                onClick={() => selectedReview && handleFeature(selectedReview)}
                disabled={actionLoading || !selectedReview}
                className="w-full flex items-center justify-center gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/20"
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                Feature review
              </Button>
              <Button
                data-testid="review-action-hide"
                variant="secondary"
                onClick={() => selectedReview && handleHide(selectedReview)}
                disabled={actionLoading || !selectedReview || selectedReview.status === "HIDDEN"}
                className="w-full flex items-center justify-center gap-2 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <EyeOff className="w-4 h-4 shrink-0" />
                Hide
              </Button>
              <Button
                data-testid="review-action-delete"
                variant="destructive"
                onClick={() => selectedReview && handleDelete(selectedReview)}
                disabled={actionLoading || !selectedReview}
                className="w-full flex items-center justify-center gap-2"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
