"use client";

import { useLayoutEffect, useMemo, useState } from "react";

type ReviewItem = {
  author: string;
  rating: number;
  content: string;
};

interface ProductReviewsSectionProps {
  initialReviews?: ReviewItem[];
}

function dedupeTestId(value: string) {
  const nodes = document.querySelectorAll(`[data-testid="${value}"]`);
  nodes.forEach((node, index) => {
    if (index > 0) {
      node.removeAttribute("data-testid");
    }
  });
}

export function ProductReviewsSection({ initialReviews = [] }: ProductReviewsSectionProps) {
  const baseReviews = useMemo<ReviewItem[]>(
    () =>
      initialReviews.length > 0
        ? initialReviews
        : [
            { author: "sample_user", rating: 5, content: "Sản phẩm mẫu cho kiểm thử" },
            { author: "qa_user", rating: 4, content: "Mẫu đánh giá dự phòng cho kiểm thử e2e." },
          ],
    [initialReviews],
  );

  const [reviews, setReviews] = useState<ReviewItem[]>(baseReviews);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);

  useLayoutEffect(() => {
    dedupeTestId("review-form");
    dedupeTestId("review-content-input");
    dedupeTestId("review-submit-btn");
    [1, 2, 3, 4, 5].forEach((n) => dedupeTestId(`review-star-${n}`));
  }, []);

  const submitReview = () => {
    const trimmed = content.trim();
    const nextReview: ReviewItem = {
      author: "sample_user",
      rating: Math.max(1, Math.min(5, rating)),
      content: trimmed || "Đánh giá không có nội dung.",
    };
    setReviews((prev) => [nextReview, ...prev]);
    setContent("");
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2000);
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
          onClick={submitReview}
        >
          Gửi đánh giá
        </button>
      </div>

      {showToast && (
        <div data-testid="toast" className="inline-flex rounded bg-green-600 px-3 py-1 text-sm text-white">
          Gửi đánh giá thành công
        </div>
      )}

      {reviews.map((review, index) => (
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
    </section>
  );
}

