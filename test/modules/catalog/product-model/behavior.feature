@catalog @greenfield @product-model
Feature: Quản trị ProductModel greenfield
  As a Catalog Operator
  I want soạn thảo và publish ProductModel
  So that Shopper nhìn thấy sản phẩm hoàn chỉnh với Variant hợp lệ

  @UC-GREEN-MODEL-IDENTITY
  Rule: ProductModel bắt đầu ở Draft và có public identity ổn định

    @accepted @api @smoke @SC-GREEN-MODEL-001
    Scenario: Tạo ProductModel mới ở trạng thái Draft
      Given Catalog Operator có quyền author ProductModel
      When Operator tạo ProductModel "Grip Handle A" mà không truyền slug
      Then ProductModel được tạo ở Draft với normalized public slug duy nhất
      And ProductModel sở hữu Category, content, media, Dimensions, Variants và Default Variant reference của nó

    @accepted @api @regression @SC-GREEN-MODEL-002
    Scenario: Slug Draft ổn định sau khi được chỉnh sửa tường minh
      Given Draft ProductModel có slug duy nhất "grip-handle-a"
      When Operator đổi slug Draft thành "grip-handle-premium"
      Then slug mới được lưu là "grip-handle-premium"
      And đổi tên ProductModel sau đó không tự tạo lại slug
      And ProductModel khác không thể dùng lại slug đó vì PRODUCT_SLUG_ALREADY_EXISTS

  @UC-GREEN-MODEL-SCOPE
  Rule: Mỗi Attribute Definition chỉ thuộc một scope trên ProductModel

    @accepted @api @regression @SC-GREEN-MODEL-003
    Scenario: Từ chối gán một Definition vào hai scope
      Given Draft ProductModel dùng Material làm Fixed Attribute
      When Operator gán Material làm Variant Dimension hoặc Variant Technical Value
      Then command bị từ chối với ATTRIBUTE_SCOPE_CONFLICT
      And Fixed Attribute assignment hiện có không thay đổi

  @UC-GREEN-MODEL-CONTENT
  Rule: ProductModel sở hữu Catalog content nhưng không sở hữu operational state

    @accepted @api @smoke @SC-GREEN-MODEL-004
    Scenario: Lưu content typed của ProductModel mà không tạo external state
      Given Draft ProductModel tồn tại với Category Active
      When Operator cập nhật description, fixed values, fixed Pack, measurements và warranty summary
      Then ProductModel lưu content đã cập nhật
      And fixed value không hợp lệ hoặc measurement dùng unit không tương thích bị từ chối bằng semantic error
      And các length measurement tương đương được lưu theo cùng canonical unit
      And ProductModel không expose inventory, warehouse, order hoặc warranty-claim state

    @accepted @api @regression @SC-GREEN-MODEL-005
    Scenario: Duy trì ordering gallery và primary image của ProductModel
      Given Draft ProductModel tồn tại
      When Operator lưu gallery có ordering và chọn một ProductImage làm primary
      Then gallery giữ nguyên ordering và chỉ có đúng một image là primary
      And khi thay primary, assignment primary của image cũ được xóa
      And ProductImage thuộc về đúng một ProductModel

  @UC-GREEN-MODEL-DEFAULT
  Rule: Publication yêu cầu Default Variant sale-ready được chọn tường minh

    @accepted @api @regression @SC-GREEN-MODEL-006
    Scenario: Từ chối publish khi chưa có Default Variant tường minh
      Given Draft ProductModel có primary image và Variant sale-ready nhưng chưa có Default Variant
      When Operator publish ProductModel
      Then command bị từ chối với DEFAULT_VARIANT_REQUIRED
      And ProductModel vẫn ở Draft

    @accepted @api @regression @SC-GREEN-MODEL-016
    Scenario: Từ chối publish với Default Variant chưa sale-ready
      Given Draft ProductModel có primary image và Default Variant không có selling amount dương bằng VND
      When Operator publish ProductModel
      Then command bị từ chối với DEFAULT_VARIANT_NOT_SALE_READY
      And ProductModel vẫn ở Draft

  @UC-GREEN-MODEL-READINESS
  Rule: Publish readiness là derived projection và được đánh giá lại khi publish

    @accepted @api @regression @SC-GREEN-MODEL-007
    Scenario: Expose publish blocker có cấu trúc mà không persist percentage
      Given Draft ProductModel thiếu name, có Category không hợp lệ, không có primary image và không có Variant sale-ready
      When Operator đánh giá publish readiness
      Then readiness là not ready và blockers chứa MISSING_NAME, INVALID_CATEGORY, MISSING_PRIMARY_MEDIA và NO_SALE_READY_VARIANT
      And mỗi issue có code, scope, target_id, section, field và message
      And readiness percentage không được persist
      And publish command bị từ chối với PRODUCT_NOT_PUBLISHABLE và ProductModel vẫn ở Draft

    @accepted @api @smoke @SC-GREEN-MODEL-008
    Scenario: Publish Draft ProductModel hoàn chỉnh thành Active
      Given Draft ProductModel có name, slug, Category, fixed values, Dimensions, primary image, Variant sale-ready và Default Variant hợp lệ
      When Operator publish ProductModel
      Then readiness được đánh giá lại trong publish transaction
      And ProductModel chuyển thành Active và đủ điều kiện xuất hiện trên public Catalog

  @UC-GREEN-MODEL-LIFECYCLE
  Rule: Lifecycle ProductModel dùng command tường minh và trạng thái terminal

    @accepted @api @regression @SC-GREEN-MODEL-009
    Scenario: Discontinue ProductModel Active thành trạng thái terminal
      Given ProductModel Active đang đọc được trên public Catalog
      When Operator discontinue ProductModel
      Then ProductModel thành Discontinued và biến mất khỏi public list và detail
      And request publish sau đó bị từ chối với INVALID_PRODUCT_LIFECYCLE_TRANSITION
      And slug của ProductModel Discontinued vẫn được reserve trên toàn Catalog

    @accepted @api @regression @SC-GREEN-MODEL-013
    Scenario: Từ chối xóa ProductModel ở mọi lifecycle state
      Given ProductModel tồn tại ở một lifecycle state
      When Operator yêu cầu xóa ProductModel
      Then command bị từ chối với INVALID_PRODUCT_LIFECYCLE_TRANSITION
      And command trên ProductModel không tồn tại bị từ chối với PRODUCT_MODEL_NOT_FOUND
      And ProductModel vẫn đọc được theo lifecycle của nó

    @accepted @api @regression @SC-GREEN-MODEL-014
    Scenario: Giữ nguyên slug của ProductModel đã publish
      Given ProductModel Active có slug "grip-handle-a"
      When Operator đổi slug của ProductModel
      Then command bị từ chối với PRODUCT_MODEL_NOT_DRAFT
      And slug vẫn là "grip-handle-a"

    @accepted @api @regression @SC-GREEN-MODEL-015
    Scenario: Từ chối discontinue ProductModel Draft
      Given ProductModel Draft tồn tại
      When Operator discontinue ProductModel
      Then command bị từ chối với PRODUCT_MODEL_NOT_ACTIVE
      And ProductModel vẫn ở Draft

  @UC-GREEN-MODEL-ACTIVE-INVARIANTS
  Rule: ProductModel Active luôn giữ đủ public invariant

    @accepted @api @regression @SC-GREEN-MODEL-010
    Scenario: Từ chối loại Variant sale-ready cuối cùng khỏi ProductModel Active
      Given ProductModel Active có đúng một Variant sale-ready và một primary image
      When Operator inactivate Variant sale-ready cuối cùng
      Then command bị từ chối với VARIANT_NOT_SALE_READY
      And ProductModel Active vẫn public hợp lệ

    @accepted @api @regression @SC-GREEN-MODEL-011
    Scenario: Từ chối Active edit làm mất primary image cuối cùng
      Given ProductModel Active có Variant sale-ready và đúng một primary image
      When Operator xóa primary image cuối cùng mà không có image thay thế
      Then command bị từ chối với MISSING_PRIMARY_MEDIA
      And ProductModel Active không thay đổi

  @UC-GREEN-MODEL-CONCURRENCY
  Rule: ProductModel command phải từ chối aggregate version cũ

    @accepted @api @regression @SC-GREEN-MODEL-012
    Scenario: Từ chối publish bằng ProductModel version cũ
      Given Operator đọc ProductModel Draft ở version 4
      And command khác đã cập nhật ProductModel lên version 5
      When Operator publish bằng expected version 4
      Then command bị từ chối với STALE_PRODUCT_MODEL
      And ProductModel vẫn ở Draft và không có mutation mới
