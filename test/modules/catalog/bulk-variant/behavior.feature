@catalog @greenfield @bulk-variant
Feature: Bulk operation trên Variant greenfield
  As a Catalog Operator
  I want thao tác semantic theo batch trên các Variant được chọn
  So that công việc lặp lại trên Variant hiệu quả và có thể kiểm tra

  @UC-GREEN-BULK-PRICE
  Rule: Bulk price update trả về kết quả theo từng item

    @accepted @api @regression @p2 @SC-GREEN-BULK-001
    Scenario: Bulk set một current selling price hợp lệ
      Given Operator chọn ba Variant nhận được price VND dương
      When Operator set current selling price thành 400000 VND
      Then batch result báo cả ba Variant là updated
      And mỗi Variant updated có current selling price được yêu cầu

    @accepted @api @regression @p2 @SC-GREEN-BULK-002
    Scenario: Giữ update hợp lệ trong price batch hỗn hợp
      Given Operator chọn một Variant hợp lệ và một Variant không nhận được price yêu cầu
      When Operator chạy bulk price update
      Then Variant hợp lệ được báo là updated
      And Variant không hợp lệ được báo là failed cùng semantic error
      And result có các phần updated, skipped và failed theo item mà không rollback item hợp lệ

  @UC-GREEN-BULK-STATUS
  Rule: Bulk status update phải tôn trọng guard của Default và Variant sale-ready cuối

    @accepted @api @regression @p2 @SC-GREEN-BULK-003
    Scenario: Trả về status result độc lập khi một Variant bị guard chặn
      Given Operator chọn nhiều Variant theo identity
      When inactivate một Variant sẽ loại Default Variant mà chưa có replacement sale-ready
      Then item đó được báo failed với DEFAULT_VARIANT_NOT_SALE_READY
      And các Variant hợp lệ khác được xử lý độc lập
      And item làm mất Variant sale-ready cuối cùng được báo failed với VARIANT_NOT_SALE_READY

  @UC-GREEN-BULK-PACK
  Rule: Bulk Pack update yêu cầu reference Active và đúng kind

    @accepted @api @regression @p2 @SC-GREEN-BULK-004
    Scenario: Chỉ gán Pack Active cho Variant nhận được Pack
      Given Operator chọn các Variant theo identity
      When Operator gán Pack Active có kind Pack
      Then Variant hợp lệ được báo là updated
      And Pack Inactive hoặc sai kind được báo failed với MASTER_INACTIVE hoặc MASTER_KIND_MISMATCH

  @UC-GREEN-BULK-MEDIA
  Rule: Bulk media assignment validate độc lập từng Variant

    @accepted @api @regression @p2 @SC-GREEN-BULK-005
    Scenario: Giữ media assignment hợp lệ trong batch hỗn hợp
      Given Operator chọn các Variant và ProductImage
      When Operator gán image thuộc cùng ProductModel
      Then assignment hợp lệ được báo updated cùng ordering
      And assignment tới image của ProductModel khác được báo failed với INVALID_VARIANT_MEDIA_ASSIGNMENT
      And assignment hợp lệ khác vẫn updated
