@catalog @greenfield @master-data
Feature: Cấu hình Catalog greenfield
  As a Catalog Operator
  I want duy trì vocabulary dùng lại được của Catalog
  So that ProductModel và Variant sử dụng reference typed, ổn định

  @UC-GREEN-MASTER-CATEGORY
  Rule: Category chỉ cung cấp phân loại và không sở hữu product rule

    @accepted @api @smoke @SC-GREEN-MASTER-001
    Scenario: Duy trì phân cấp và thứ tự hiển thị của Category
      Given Catalog Operator có quyền quản trị cấu hình Catalog
      When Operator tạo một Category gốc cùng Category con và gán vị trí hiển thị
      Then hệ thống bảo toàn quan hệ phân cấp và vị trí của các Category
      And Category không sở hữu Attribute schema, Product Template hoặc publication rule

    @accepted @api @regression @SC-GREEN-MASTER-002
    Scenario: Vô hiệu hóa Category mà không ẩn ProductModel Active hiện có
      Given ProductModel Active đang tham chiếu một Category Active
      When Operator vô hiệu hóa Category đó
      Then ProductModel mới không thể được gán hoặc publish vào Category đó
      And assignment tới Category không tồn tại bị từ chối với CATEGORY_NOT_FOUND
      And assignment tới Category đã vô hiệu hóa bị từ chối với CATEGORY_INACTIVE
      And ProductModel Active hiện có vẫn đọc được trên public Catalog

    @accepted @api @regression @SC-GREEN-MASTER-003
    Scenario: Category không thể bị hard-delete
      Given Category tồn tại để lưu lịch sử phân loại
      When Operator yêu cầu xóa Category
      Then command bị từ chối
      And Category vẫn đọc được

  @UC-GREEN-MASTER-TYPED-DEFINITIONS
  Rule: Attribute Definition bảo toàn value semantic đã khai báo

    @accepted @api @smoke @SC-GREEN-MASTER-004
    Scenario: Tạo đủ các loại Attribute Definition được hỗ trợ
      Given Catalog Operator có quyền quản trị Attribute Definition
      When Operator tạo Definition loại Text, Number, Boolean, Enum và MasterReference
      Then mỗi Definition lưu đúng Value Kind đã khai báo
      And Number lưu unit family và canonical unit thuộc length registry được hỗ trợ
      And Boolean không có unit hoặc Master target
      And Enum sở hữu Attribute Option có identity ổn định, không dùng raw string array
      And MasterReference trỏ đúng một trong Material, Finish hoặc Pack

    @accepted @api @regression @SC-GREEN-MASTER-007
    Scenario: Definition đã dùng tuân theo quy tắc semantic và historical reference
      Given Attribute Definition đã được ProductModel sử dụng
      When Operator áp dụng thay đổi display metadata và semantic fields cho Definition
      Then display metadata được cập nhật nhưng semantic key, Value Kind, unit và reference target không đổi
      And thay đổi semantic bị từ chối với ATTRIBUTE_DEFINITION_SEMANTIC_IMMUTABLE
      And assignment tới Definition không tồn tại bị từ chối với ATTRIBUTE_DEFINITION_NOT_FOUND
      And khi Definition bị vô hiệu hóa, assignment mới bị từ chối với ATTRIBUTE_DEFINITION_INACTIVE còn value lịch sử vẫn đọc được

  @UC-GREEN-MASTER-OPTIONS
  Rule: Enum Option có identity ổn định và lifecycle không phá hủy lịch sử

    @accepted @api @smoke @SC-GREEN-MASTER-005
    Scenario: Thay đổi metadata của Enum Option mà không đổi identity
      Given Enum Attribute Definition tồn tại
      When Operator thêm Option có code, label, position và swatch media rồi cập nhật display metadata
      Then code của Option vẫn là identity ổn định
      And code của Option là duy nhất trong cùng một Definition
      And label, position và swatch media được cập nhật độc lập
      And code của Option đã được dùng không thể thay đổi

    @accepted @api @regression @SC-GREEN-MASTER-006
    Scenario: Vô hiệu hóa Enum Option đã dùng mà không viết lại lịch sử
      Given Attribute Option đang được ProductModel hiện có tham chiếu
      When Operator vô hiệu hóa Option đó
      Then assignment mới sử dụng Option bị từ chối với ATTRIBUTE_OPTION_INACTIVE
      And Option không tồn tại bị từ chối với ATTRIBUTE_OPTION_NOT_FOUND
      And reference của ProductModel hiện có vẫn đọc được
      And hard-delete Option bị từ chối với ATTRIBUTE_OPTION_IN_USE

  @UC-GREEN-MASTER-REFERENCES
  Rule: Master reference phải là Master Active và đúng kind

    @accepted @api @smoke @SC-GREEN-MASTER-008
    Scenario: Bảo toàn reference typed cho Material, Finish và Pack
      Given Catalog Operator có quyền quản trị Material, Finish và Pack
      When Operator tạo ba kind Master rồi vô hiệu hóa một Master đang được tham chiếu
      Then assignment mới vào Master đó bị từ chối với MASTER_INACTIVE
      And reference hiện có của ProductModel và Variant vẫn đọc được
      And reference sai Master kind bị từ chối với MASTER_KIND_MISMATCH
      And reference tới Master không tồn tại bị từ chối với MASTER_NOT_FOUND
      And cặp kind và name của Master là duy nhất trong Catalog
      And kind của Master không đổi sau khi tạo
      And Finish có thể lưu swatch media còn Pack lưu selling unit, quantity và base unit
      And Master không tạo stock hoặc quantity-pricing state
