@catalog @greenfield @product-preview
Feature: Preview storefront của ProductModel greenfield
  As a Catalog Operator
  I want preview ProductModel Draft
  So that có thể kiểm tra projection dành cho Shopper trước khi publish

  @UC-GREEN-PREVIEW-DRAFT
  Rule: Draft preview là private và không đổi lifecycle state

    @accepted @api @regression @p2 @SC-GREEN-PREVIEW-001
    Scenario: Preview Draft mà không làm ProductModel public
      Given Draft ProductModel có content, media, Dimension và Variant
      When Operator preview ProductModel
      Then preview trả về ProductModel storefront projection
      And ProductModel vẫn là Draft và không xuất hiện trong public Catalog query

    @accepted @api @regression @p2 @SC-GREEN-PREVIEW-002
    Scenario: Preview content và selection data theo thứ tự
      Given Draft ProductModel có name, media, fixed attribute, Dimension có thứ tự và Option có thứ tự
      When Operator preview ProductModel
      Then preview chứa các giá trị đó theo display order
      And preview không expose inventory, warehouse, order hoặc warranty-claim state

  @UC-GREEN-PREVIEW-DEFAULT
  Rule: Preview dùng Default Variant tường minh khi Variant đó tồn tại

    @accepted @api @regression @p2 @SC-GREEN-PREVIEW-003
    Scenario: Preview projection của Default Variant tường minh
      Given Draft ProductModel có Variant sale-ready được chọn làm Default
      When Operator preview ProductModel
      Then option ban đầu, price, SKU và media priority lấy từ Default Variant
      And preview không tự chọn Variant đầu tiên hoặc rẻ nhất

  @UC-GREEN-PREVIEW-TECHNICAL
  Rule: Preview hiển thị technical value mà không đổi Variant identity

    @accepted @api @regression @p2 @SC-GREEN-PREVIEW-004
    Scenario: Preview technical value bên ngoài canonical identity
      Given Draft ProductModel có Variant Dimension và Variant Technical Value đã khai báo
      When Operator preview Variant cùng technical value của nó
      Then technical value hiển thị trong typed projection phù hợp
      And canonical combination của Variant chỉ dựa trên Dimension selection
