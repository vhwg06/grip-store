@catalog @greenfield @variant-generation
Feature: Sinh combination Variant greenfield
  As a Catalog Operator
  I want preview và generate có chọn lọc các combination
  So that Cartesian expansion được kiểm soát và có thể lặp lại

  @UC-GREEN-GENERATION-PREVIEW
  Rule: Combination preview chỉ đọc và phân loại Cartesian space

    @accepted @api @smoke @SC-GREEN-GENERATION-001
    Scenario: Preview Cartesian combination mà không persist Variant
      Given Draft ProductModel có Color Red, Blue và Size S, M
      When Operator preview Variant combination
      Then preview chứa bốn canonical combination
      And mỗi combination được phân loại là existing, new hoặc excluded
      And không có Variant nào được persist

    @accepted @api @regression @SC-GREEN-GENERATION-002
    Scenario: Preview combination đã tồn tại là existing
      Given ProductModel đã có Variant cho Color Red và Size S
      When Operator preview Cartesian combination
      Then combination đó được phân loại là existing
      And combination hợp lệ khác được phân loại là new mà không tạo duplicate

    @accepted @api @regression @SC-GREEN-GENERATION-003
    Scenario: Preview combination vượt warning threshold
      Given ProductModel có 101 Cartesian combination hợp lệ
      When Operator preview Variant combination
      Then preview thành công với VARIANT_COMBINATION_WARNING
      And warning không block preview hoặc persist Variant

    @accepted @api @regression @SC-GREEN-GENERATION-004
    Scenario: Từ chối preview vượt Cartesian hard limit
      Given ProductModel có 1001 Cartesian combination hợp lệ
      When Operator preview Variant combination
      Then command bị từ chối với VARIANT_COMBINATION_LIMIT_EXCEEDED
      And không có combination hoặc Variant nào được persist

  @UC-GREEN-GENERATION-PERSISTENCE
  Rule: Generation chỉ persist combination được chọn và có tính idempotent

    @accepted @api @smoke @SC-GREEN-GENERATION-005
    Scenario: Generate chỉ subset combination đã chọn
      Given ProductModel có sáu Cartesian combination hợp lệ
      When Operator chọn hai combination mới và generate Variant
      Then chính xác hai Variant Inactive được tạo
      And bốn combination không được chọn vẫn chưa persist

    @accepted @api @regression @SC-GREEN-GENERATION-006
    Scenario: Retry generate combination đã tồn tại theo cách idempotent
      Given ProductModel đã có canonical combination được chọn
      When Operator generate lại combination đó
      Then item result là existing
      And không tạo duplicate Variant

    @accepted @api @regression @SC-GREEN-GENERATION-007
    Scenario: Trả về kết quả độc lập cho generation batch hỗn hợp
      Given generation request có một combination mới hợp lệ và một combination không hợp lệ
      When Operator generate các combination được chọn
      Then item hợp lệ được tạo thành Variant Inactive
      And item không hợp lệ trả về failed cùng semantic error
      And item hợp lệ không bị rollback

    @accepted @api @regression @SC-GREEN-GENERATION-008
    Scenario: Từ chối generate vượt persisted Variant limit
      Given ProductModel đã có 499 Variant được persist
      When Operator chọn hai combination mới và generate chúng
      Then command bị từ chối với VARIANT_COMBINATION_LIMIT_EXCEEDED
      And cả hai Variant mới đều không được persist
