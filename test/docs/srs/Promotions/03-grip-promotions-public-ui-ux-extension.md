# GRIP Promotions — Public UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** PROMO-03 — Public UI/UX Extension  
**Inputs:**  
- `02-grip-promotions-srs.md`  
- `../catalog/catalog-public-ui-ux-guide.md`  
- `../catalog/04-merchandising-cart-interactions.md`  
- `../checkout/checkout_ui_ux_research.md`

## 1. Rule

This is not a standalone Promotions storefront.

```text
existing GRIP Catalog / Cart / Checkout UX
+ Promotions semantics
+ reference patterns
→ next GRIP public UX
```

## 2. Existing UX that must remain intact

Catalog remains responsible for product discovery and product decision support.

Checkout remains a focused transaction environment with progressively reduced information and one obvious current task.

Promotions must not introduce a separate customer destination merely to display discounts.

## 3. Catalog listing extension

The existing Catalog merchandising/pricing slot is the correct home for automatic product discounts.

When an effective promotion changes product price, the product tile may show:

```text
[optional merchandising status]
Product

990.000đ          effective promotional price
1.290.000đ        regular price
-23%              only when authoritative
```

Rules:

- effective price must be visually primary;
- regular price must remain readable but secondary;
- a generic `Giảm giá` badge cannot replace the price relationship;
- do not add multiple same-weight badges for promotion + merchandising;
- no countdown unless the real promotion contract has an authoritative end time and the product decision explicitly requires countdown UX;
- expired promotion state must disappear rather than remain as decorative urgency.

## 4. PDP extension

Reuse the existing PDP purchase-decision panel.

Promotion information sits near price, not in a detached marketing card.

Suggested composition:

```text
990.000đ
1.290.000đ
Tiết kiệm 300.000đ

Ưu đãi đến 07/09
```

Only show validity when it materially helps the buying decision.

Do not expose internal promotion names unless they are intentionally customer-facing.

## 5. Shopping bag / Checkout coupon entry

Coupon entry belongs in the purchase journey.

Follow the existing Checkout principle:

> one obvious current task, progressively reduced information.

Recommended compact pattern:

```text
Mã khuyến mãi
[Nhập mã] [Áp dụng]
```

or collapsed until requested:

```text
+ Thêm mã khuyến mãi
```

The coupon control must not dominate buyer/delivery/payment tasks.

## 6. Successful application

After success, do not keep the text field looking unresolved.

Prefer:

```text
Mã khuyến mãi
SUMMER10                         [Xóa]
Đã áp dụng · Giảm 100.000đ
```

Order summary:

```text
Tạm tính                     1.500.000đ
Khuyến mãi                    -100.000đ
Phí giao hàng                    30.000đ
----------------------------------------
Tổng                          1.430.000đ
```

For free shipping:

```text
Phí giao hàng                 30.000đ
Mã miễn phí vận chuyển       -30.000đ
```

Do not silently rewrite shipping price to zero without explaining the commercial effect.

## 7. Invalid code feedback

Use actionable business copy where the reason is known.

Examples:

```text
Mã không hợp lệ.

Mã này chưa bắt đầu.

Mã này đã hết hạn.

Đơn hàng cần đạt tối thiểu 500.000đ để dùng mã này.

Mã này không áp dụng cho sản phẩm trong giỏ hàng.

Mã này đã hết lượt sử dụng.
```

Never show raw error enums.

Preserve the entered code after a recoverable error so the user can inspect/correct it.

## 8. Cart mutation after coupon

If quantity/product changes make the current coupon invalid:

```text
cart changes
→ recalculate
→ invalidate/remove effect
→ explain why
```

The UI must not leave a green `Đã áp dụng` state beside a total that no longer includes the discount.

## 9. One-code rule

V1 supports one active Coupon.

If the user enters another code while one is active, the UX should make replacement explicit rather than pretending both stack.

Example:

```text
Đang dùng SUMMER10.
Áp dụng mã mới sẽ thay thế mã hiện tại.

[Hủy] [Thay mã]
```

A lighter direct replacement interaction is acceptable if consequence remains obvious.

## 10. Mobile

Promotion UI must preserve the existing mobile purchase flow.

- no permanent promotion sidebar;
- price hierarchy remains readable in one column;
- coupon entry uses normal form controls and full-width action where needed;
- order-summary discount row remains visible before final commit;
- error text stays adjacent to coupon control.

## 11. Public surfaces intentionally not created

Do not create by default:

```text
Promotions account page
Coupon wallet
Rewards center
Standalone promotions dashboard
Customer promotion history
Dedicated flash-sale application
```

An editorial offers/landing page may exist only through existing Content/Catalog composition if later required.

## 12. Acceptance direction

A public Promotions pass is coherent when a shopper can:

```text
see a real promotional price relationship
→ add/select products normally
→ enter a coupon during purchase
→ understand success/failure
→ see the exact effect in totals
→ place an Order with no ambiguity about what was paid
```

Promotions should feel like a natural commercial layer inside GRIP, not a new product area.