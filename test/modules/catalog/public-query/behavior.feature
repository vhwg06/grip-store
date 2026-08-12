@catalog @greenfield @public-query
Feature: Public Catalog greenfield
  As a Shopper
  I want ProductModel projection và Variant resolution chính xác
  So that public selection chỉ expose Catalog data hợp lệ và có thể bán

  @UC-GREEN-PUBLIC-LIST
  Rule: Public listing chỉ chứa ProductModel Active đủ điều kiện

    @accepted @api @smoke @SC-GREEN-PUBLIC-001
    Scenario: List ProductModel Active có Variant sale-ready
      Given Catalog chứa ProductModel Draft, Active và Discontinued
      When Shopper list ProductModel trên public Catalog
      Then chỉ ProductModel Active có ít nhất một Variant sale-ready được trả về
      And ProductModel là product concept được list, không có Variant như Product độc lập

    @accepted @api @regression @SC-GREEN-PUBLIC-008
    Scenario: Phân trang và lọc public ProductModel theo Category
      Given ProductModel Active tồn tại trong nhiều Category
      When Shopper yêu cầu một page có limit cố định và filter theo một Category
      Then số lượng kết quả không vượt quá limit
      And mọi ProductModel trả về đều thuộc Category được yêu cầu

  @UC-GREEN-PUBLIC-DETAIL
  Rule: Public detail dùng ProductModel identity ổn định và public projection

    @accepted @api @smoke @SC-GREEN-PUBLIC-002
    Scenario: Đọc detail ProductModel Active bằng slug ổn định
      Given ProductModel Active có slug "grip-handle-a"
      When Shopper đọc public detail bằng slug đó
      Then response chứa content, Category, gallery, Dimension có thứ tự, Option có thứ tự và Variant sale-ready public
      And response chứa current selling information nhưng không có inventory, warehouse, order hoặc warranty-claim state
      And technical value public của Variant sale-ready giữ typed canonical form khi được expose
      And slug của Draft hoặc Discontinued ProductModel không có public detail projection

    @accepted @api @regression @SC-GREEN-PUBLIC-003
    Scenario: Dùng Default Variant tường minh cho public state ban đầu
      Given ProductModel Active có nhiều Variant sale-ready và một Default Variant tường minh
      When Shopper mở public detail
      Then selected options, price ban đầu, SKU và media priority lấy từ Default Variant
      And storefront không tự chọn Variant đầu tiên hoặc rẻ nhất

    @accepted @api @regression @SC-GREEN-PUBLIC-007
    Scenario: Resolve Variant media với fallback về ProductModel media
      Given Variant public không có primary Variant image
      When Shopper đọc projection của Variant đó
      Then gallery và primary media của ProductModel được trả về
      And Variant có primary image dùng Variant image với priority cao hơn

  @UC-GREEN-PUBLIC-RESOLUTION
  Rule: Public Variant resolution chỉ trả về combination sale-ready chính xác

    @accepted @api @smoke @SC-GREEN-PUBLIC-004
    Scenario: Resolve exact public Variant combination
      Given ProductModel Active có Variant Active sale-ready cho Color Red và Size M
      When Shopper resolve Color Red và Size M
      Then Variant chính xác đó được trả về
      And combination thiếu, thiếu một phần, bất ngờ, inactive hoặc không sale-ready không trả về public Variant

    @accepted @api @regression @SC-GREEN-PUBLIC-005
    Scenario: Resolve numeric representation tương đương theo canonical identity
      Given Variant public có Size canonical là 200 mm
      When Shopper resolve Size tương đương là 20 cm
      Then cùng Variant đó được trả về

    @accepted @api @regression @SC-GREEN-PUBLIC-006
    Scenario: Tính available option từ Variant public tương thích
      Given ProductModel Active có Variant public, inactive và không tương thích
      When Shopper chọn một Dimension value và yêu cầu available option
      Then mỗi Option trả về hoàn thiện ít nhất một Variant sale-ready
      And Option chỉ thuộc Variant inactive hoặc không tương thích không xuất hiện
      And thứ tự hiển thị của Dimension và Option được bảo toàn
