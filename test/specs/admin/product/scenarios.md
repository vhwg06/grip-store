# Catalog Base Scenario Map

## SC-CAT-01 Deactivate Category Without Breaking Existing Model

- Context: Category đang được ProductModel Inactive tham chiếu.
- Main flow:
  1. Admin deactivate Category.
  2. Hệ thống chặn assignment mới.
  3. Admin publish lại ProductModel cũ đủ publication invariant.
- End state: ProductModel publish được; Category không gán mới được.
- Rule: deactivation is non-destructive.

## SC-ATTR-01 Preserve Used Attribute Structure

- Context: Numeric attribute `Overall length` đã có ProductModel value.
- Main flow:
  1. Admin cập nhật display name.
  2. Hệ thống lưu metadata mới.
- Exception flow: admin đổi numeric definition thành text hoặc đổi unit family; hệ thống reject.
- End state: semantic data không bị reinterpret.

## SC-MODEL-01 Build Draft With Distinct Attribute Scopes

- Context: admin tạo ProductModel `Tay kéo A`.
- Main flow:
  1. Admin set Material fixed value.
  2. Admin set Size làm VariantDimension.
  3. Admin khai báo Weight là variant-specific technical attribute.
  4. Hệ thống chấp nhận ba scope không trùng definition.
- Exception flow: admin dùng một definition đồng thời fixed và dimension; hệ thống reject.
- End state: Draft có structure rõ để tạo Variant.

## SC-VAR-01 Generate Selected Canonical Combinations

- Context: ProductModel có Material, Finish, Size dimensions.
- Main flow:
  1. Admin preview combinations.
  2. Admin chọn subset hợp lệ.
  3. Hệ thống tạo Variant với mỗi dimension đúng một value.
- Exception flow: subset trùng canonical combination đã tồn tại; hệ thống reject record trùng.
- End state: chỉ Variant hợp lệ được tạo.

## SC-VAR-02 Keep Variant Technical Values Outside Identity

- Context: Size `300 mm` là selected option và Weight là variant-specific definition.
- Main flow:
  1. Admin tạo Variant size `300 mm`.
  2. Admin set Weight `1.2 kg` trên Variant.
  3. Hệ thống lưu Weight mà không đổi combination identity.
- End state: technical projection khác identity selection.

## SC-COM-01 Reject Mutation That Breaks Active Model

- Context: ProductModel Active chỉ có một sale-ready Variant và one primary model image.
- Main flow:
  1. Admin cố inactivate Variant cuối cùng, remove SKU/price cuối cùng, hoặc remove primary image.
  2. Hệ thống reject command.
- Alternate flow: admin unpublish model, chỉnh sửa, rồi publish lại khi invariant đủ.
- End state: Active model không bị invalid state.

## SC-PUB-01 Resolve Only Publicly Sellable Variant

- Context: ProductModel Active có Variant Active sale-ready và Variant Inactive.
- Main flow:
  1. Customer chọn option hợp lệ.
  2. Hệ thống trả available options chỉ từ publicly sellable Variant.
  3. Customer resolve combination exact.
- End state: Variant Inactive không xuất hiện hoặc resolve được công khai.

## SC-PRICE-01 Apply Bulk Selling Price Atomically

- Context: admin chọn nhiều Variant.
- Main flow:
  1. Admin set một SellingPrice hợp lệ cho nhóm.
  2. Hệ thống cập nhật tất cả Variant.
- Exception flow: một Variant không hợp lệ hoặc amount không dương; hệ thống không cập nhật Variant nào.
- End state: bulk update all-or-nothing.
