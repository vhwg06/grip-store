"use client";

import { useSearchParams } from "next/navigation";
import { ProductListingContent } from "@/components/product/product-listing-content";
import { WishlistSection } from "@/components/wishlist-section";
import { useAuth } from "@/application/hooks/useAuth";
import { useWishlist } from "@/application/hooks/useWishlist";

export function BuyPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { user, isAdmin } = useAuth();
  const { items } = useWishlist(30);

  if (tab === "wishlist") {
    return (
      <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px] py-12">
        <WishlistSection initialItems={items} isLoggedIn={!!user?.id} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1440px] px-4 md:px-[125px] py-12">
      <ProductListingContent />
    </div>
  );
}
