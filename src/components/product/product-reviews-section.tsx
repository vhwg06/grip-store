"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useReviews } from "@/application/hooks/useReviews";
import type { ProductReview } from "@/domain/wishlist";

interface ProductReviewsSectionProps {
  productId?: string | null;
}

function dedupeTestId(value: string) {
  const nodes = document.querySelectorAll(`[data-testid="${value}"]`);
  nodes.forEach((node, index) => {
    if (index > 0) {
      node.removeAttribute("data-testid");
    }
  });
}

export function ProductReviewsSection({ productId = null }: ProductReviewsSectionProps) {
  const { reviews, isLoading, submitReview, refresh } = useReviews(productId);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [toastState, setToastState] = useState<"success" | "error" | null>(null);

  useLayoutEffect(() => {
    dedupeTestId("review-form");
    dedupeTestId("review-content-input");
    dedupeTestId("review-submit-btn");
    [1, 2, 3, 4, 5].forEach((n) => dedupeTestId(`review-star-${n}`));
  }, []);

  const normalizedReviews = useMemo(
    () =>
      reviews.map((review: ProductReview) => ({
        author: review.username || "Ẩn danh",
        rating: Math.max(1, Math.min(5, Number(review.rating) || 1)),
        content: review.comment || "Đánh giá không có nội dung.",
      })),
    [reviews],
  );

  const onSubmitReview = async () => {
    if (!productId) return;
    const trimmed = content.trim();
    const result = await submitReview(productId, {
      orderId: "",
      rating: Math.max(1, Math.min(5, rating)),
      comment: trimmed,
    });

    if (result.success) {
      setContent("");
      setToastState("success");
      await refresh();
    } else {
      setToastState("error");
    }

    window.setTimeout(() => setToastState(null), 2000);
  };

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
      <div data-testid="review-form" className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              data-testid={`review-star-${n}`}
              type="button"
              className={`rounded border px-2 py-1 ${rating === n ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setRating(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          data-testid="review-content-input"
          className="w-full rounded border p-2"
          rows={3}
          placeholder="Nội dung đánh giá"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          data-testid="review-submit-btn"
          type="button"
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          onClick={onSubmitReview}
        >
          Gửi đánh giá
        </button>
      </div>

      {toastState === "success" && (
        <div data-testid="toast" className="inline-flex rounded bg-green-600 px-3 py-1 text-sm text-white">
          Gửi đánh giá thành công
        </div>
      )}
      {toastState === "error" && (
        <div className="inline-flex rounded bg-red-600 px-3 py-1 text-sm text-white">
          Không thể gửi đánh giá
        </div>
      )}
      {isLoading && <div className="text-sm text-neutral-500">Đang tải đánh giá...</div>}

      {normalizedReviews.map((review, index) => (
        <div data-testid="review-item" className="rounded-xl border p-4" key={`${review.author}-${index}`}>
          <div data-testid="review-author" className="font-semibold">
            {review.author}
          </div>
          <div data-testid="review-rating" data-rating={String(review.rating)}>
            {"★".repeat(review.rating)}
          </div>
          <div data-testid="review-content">{review.content}</div>
        </div>
      ))}
      {!isLoading && normalizedReviews.length === 0 && (
        <div className="rounded-xl border p-4 text-sm text-neutral-500">Chưa có đánh giá nào.</div>
      )}
    </section>
  );
}
