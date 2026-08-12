@catalog @greenfield @variant
Feature: Quản trị Variant greenfield
  As a Catalog Operator
  I want duy trì identity và commercial data hợp lệ của Variant
  So that mỗi sellable unit có thể được nhận diện duy nhất

  @UC-GREEN-VARIANT-DIMENSIONS
  Rule: Variant Dimension định nghĩa selection space đầy đủ và có thứ tự

    @accepted @api @smoke @SC-GREEN-VARIANT-001
    Scenario: Cấu hình Variant Dimension và allowed value có thứ tự
      Given Draft ProductModel có các Attribute Definition dùng lại được
      When Operator thêm Color ở position 1 và Size ở position 2 làm Dimension
      Then ProductModel lưu hai Dimension cùng allowed value theo display order
      And display order không tham gia Variant identity
      And thêm lại cùng một Definition vào Dimension bị từ chối với VARIANT_DIMENSION_DUPLICATED

    @accepted @api @regression @SC-GREEN-VARIANT-002
    Scenario: Từ chối Variant có Dimension thiếu hoặc ngoài schema
      Given ProductModel có Dimension Color và Size
      When Operator tạo Variant không có giá trị Size
      Then command bị từ chối với MISSING_DIMENSION_VALUE
      And giá trị của Dimension không thuộc schema bị từ chối với UNEXPECTED_DIMENSION_VALUE

    @accepted @api @regression @SC-GREEN-VARIANT-003
    Scenario: Từ chối Variant value ngoài allowed value Active
      Given ProductModel có Size Dimension với allowed value Active là M và L
      When Operator tạo Variant với Size XL
      Then command bị từ chối với INVALID_DIMENSION_VALUE
      And Variant mới dùng Size L sau khi L bị vô hiệu hóa bị từ chối với ATTRIBUTE_OPTION_INACTIVE

    @accepted @api @regression @SC-GREEN-VARIANT-004
    Scenario: Khóa Dimension structure của ProductModel Active nhưng vẫn thêm value hợp lệ
      Given ProductModel Active có Color Dimension và các Variant hiện có
      When Operator xóa Dimension hoặc thay Definition của Dimension
      Then command bị từ chối với VARIANT_DIMENSION_LOCKED
      And thêm Color value hợp lệ không làm thay đổi identity của Variant hiện có
      And reorder allowed value chỉ thay đổi display order
      And xóa allowed value đang được Variant hiện có sử dụng bị từ chối với VARIANT_DIMENSION_LOCKED

  @UC-GREEN-VARIANT-IDENTITY
  Rule: Variant identity là canonical và duy nhất trong một ProductModel

    @accepted @api @smoke @SC-GREEN-VARIANT-005
    Scenario: Từ chối text selection tương đương là duplicate combination
      Given ProductModel có text Color Dimension
      And Variant tồn tại với Color canonical là "black handle"
      When Operator tạo Variant với Color " Black  Handle "
      Then command bị từ chối với DUPLICATE_VARIANT_COMBINATION

    @accepted @api @regression @SC-GREEN-VARIANT-006
    Scenario: Từ chối numeric selection tương đương là duplicate combination
      Given ProductModel có length Size Dimension
      And Variant tồn tại với Size canonical là "200 mm"
      When Operator tạo Variant với Size "20 cm"
      Then command bị từ chối với DUPLICATE_VARIANT_COMBINATION
      And canonical identity độc lập với display order và cách biểu diễn unit
      And canonical identity được tính từ selection đã normalize, không dùng giá trị client cung cấp làm authoritative

    @accepted @api @regression @SC-GREEN-VARIANT-007
    Scenario: Giữ technical value bên ngoài Variant identity
      Given HandleLength là Variant Technical Value và Size là Variant Dimension
      When Operator tạo Variant với Size 300 mm và gán HandleLength 1200 mm
      Then HandleLength đọc được như technical value
      And canonical combination chỉ dựa trên Dimension selection
      And selected Dimension options không bị mutate sau khi Variant được tạo
      And gán technical value cho Definition không thuộc technical scope bị từ chối với INVALID_VARIANT_TECHNICAL_VALUE

    @accepted @api @regression @SC-GREEN-VARIANT-008
    Scenario: Normalize và reserve SKU trên toàn Catalog
      Given không có Variant nào sở hữu SKU normalized "abc-001"
      When Operator gán SKU " ABC-001 " cho một Variant
      Then SKU canonical được lưu là "abc-001"
      And Variant khác không thể dùng "ABC-001" vì command trả về SKU_ALREADY_EXISTS

  @UC-GREEN-VARIANT-READINESS
  Rule: Variant status và sale readiness là hai khái niệm derived khác nhau

    @accepted @api @smoke @SC-GREEN-VARIANT-009
    Scenario: Variant Active chỉ sale-ready khi commercial data hợp lệ
      Given Variant Inactive có selected Dimension value hợp lệ
      When Operator activate Variant mà không có price VND dương
      Then Variant trở thành Active nhưng chưa sale-ready
      And khi gán price VND dương thì Variant trở thành sale-ready

    @accepted @api @regression @SC-GREEN-VARIANT-010
    Scenario: Bảo vệ Default Variant khi đổi status
      Given ProductModel Active có một Default Variant sale-ready và một Variant sale-ready khác
      When Operator inactivate Default Variant mà chưa chọn replacement
      Then command bị từ chối với DEFAULT_VARIANT_NOT_SALE_READY
      And chọn Variant còn lại làm Default cho phép Variant cũ trở thành Inactive

    @accepted @api @regression @SC-GREEN-VARIANT-013
    Scenario: Bảo toàn commercial history của Variant Inactive
      Given Variant Active có SKU, price, Pack và selected options
      When Operator inactivate Variant
      Then Variant bị loại khỏi public options và resolution
      And SKU, price, Pack, selected options và history vẫn đọc được
      And SKU của Variant Inactive vẫn được reserve và không thể gán cho Variant khác

  @UC-GREEN-VARIANT-PACK
  Rule: Pack là source of truth của selling unit

    @accepted @api @regression @SC-GREEN-VARIANT-011
    Scenario: Dùng Pack làm fixed reference hoặc Dimension reference
      Given ProductModel có fixed Pack reference và không có Pack Dimension
      When Operator tạo Variant từ các Dimension khác
      Then Variant kế thừa fixed Pack và Pack không làm đổi combination identity
      And khi Pack là Dimension, mỗi Variant dùng Pack Active được phép và đúng kind Pack
      And canonical identity của MasterReference dùng stable Master identity thay vì display name

  @UC-GREEN-VARIANT-MEDIA
  Rule: Variant media chỉ được tham chiếu trong ProductModel aggregate

    @accepted @api @regression @SC-GREEN-VARIANT-012
    Scenario: Gán ProductImage cho Variant cùng ProductModel
      Given ProductModel có ProductImage và Variant
      When Operator gán một ProductImage cho nhiều Variant của ProductModel đó
      Then mỗi assignment giữ ordering riêng và mỗi Variant có tối đa một primary image
      And gán image từ ProductModel khác bị từ chối với INVALID_VARIANT_MEDIA_ASSIGNMENT
