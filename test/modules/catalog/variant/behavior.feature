@catalog @variant
Feature: Catalog Base Variant
  As a Catalog Operator
  I want to configure Variant combinations and commercial data
  So that every sellable unit has a stable identity and valid price

  @UC-CAT-VARIANT-COMBINATION
  Rule: Variant selects every required dimension

    @accepted @api @SC-CAT-VARIANT-001
    Scenario: Variant duoc tao voi mot value cho moi dimension
      Given ProductModel co VariantDimensions Material, Finish va Size
      When Catalog Operator tao Variant chon mot value hop le cho moi dimension
      Then he thong tao Variant voi selected option values day du

    @accepted @api @SC-CAT-VARIANT-002
    Scenario: Variant thieu Size khong duoc tao
      Given ProductModel co VariantDimensions Material, Finish va Size
      When Catalog Operator tao Variant khong chon Size
      Then he thong tu choi incomplete combination

  @UC-CAT-VARIANT-CANONICAL
  Rule: Canonical combination is unique within a ProductModel

    @accepted @api @SC-CAT-VARIANT-003
    Scenario: Hai representation length tuong duong khong tao hai combinations
      Given ProductModel co Numeric VariantDimension Size voi unit family "length"
      And Variant da ton tai voi Size "200 mm"
      When Catalog Operator tao Variant chon Size "20 cm"
      Then he thong tu choi duplicate canonical combination

    @accepted @api @SC-CAT-VARIANT-004
    Scenario: Cung option co the ton tai tren ProductModel khac
      Given ProductModel A co Variant Material "Inox 304", Finish "Black" va Size "200 mm"
      And ProductModel B co cung ba VariantDimensions
      When Catalog Operator tao Variant tren ProductModel B voi cung selected values
      Then he thong tao Variant tren ProductModel B

    @accepted @api @SC-CAT-VARIANT-011
    Scenario: Generate Variant chi tao selected subset khong tao Cartesian product
      Given ProductModel co VariantDimensions Material, Finish va Size voi nhieu allowed values
      When Catalog Operator generate mot subset selected combinations
      Then he thong chi tao cac Variant duoc chon
      And he thong khong tu tao toan bo Cartesian product

  @UC-CAT-VARIANT-TECHNICAL
  Rule: Variant technical values do not change identity

    @accepted @api @SC-CAT-VARIANT-005
    Scenario: Variant luu Weight rieng sau khi chon Size
      Given ProductModel khai bao Weight la variant-specific technical attribute
      And Variant co Size selected option "300 mm"
      When Catalog Operator set Weight "1.2 kg" tren Variant
      Then he thong luu VariantAttributeValue Weight
      And combination identity cua Variant khong thay doi

    @accepted @api @SC-CAT-VARIANT-006
    Scenario: Variant khong tu gan attribute chua khai bao variant-specific
      Given ProductModel khong khai bao Projection la variant-specific attribute
      When Catalog Operator set Projection "60 mm" tren Variant
      Then he thong tu choi VariantAttributeValue

  @UC-CAT-VARIANT-DIMENSIONS
  Rule: Dimension structure is stable after Variants exist

    @accepted @api @SC-CAT-VARIANT-007
    Scenario: Model co Variant duoc them selectable value moi
      Given ProductModel da co Variant va co VariantDimension Finish
      When Catalog Operator them Finish value moi vao dimension
      Then he thong chap nhan selectable value moi

    @accepted @api @SC-CAT-VARIANT-008
    Scenario: Model co Variant khong duoc them dimension moi
      Given ProductModel da co it nhat mot Variant
      When Catalog Operator them VariantDimension Handing
      Then he thong tu choi structural dimension change

  @UC-CAT-VARIANT-AVAILABILITY
  Rule: Inactive Variants are not public options

    @accepted @api @SC-CAT-VARIANT-009
    Scenario: Inactive Variant bi loai khoi available options
      Given ProductModel Active co Variant Active va Variant Inactive khac nhau o Finish
      When customer lay available options
      Then he thong khong tra Finish chi co tren Variant Inactive

    @accepted @api @SC-CAT-VARIANT-010
    Scenario: Variant inactive co the reactivate ma khong doi selected options
      Given Variant dang "Inactive" voi selected options bat bien
      When Catalog Operator reactivate Variant
      Then Variant chuyen sang "Active"
      And selected options van giu nguyen

  @UC-CAT-VARIANT-SKU
  Rule: SKU is normalized and unique

    @accepted @api @SC-CAT-VARIANT-SKU-001
    Scenario: SKU duoc trim va case-fold truoc khi luu
      Given khong co Variant nao da dung SKU canonical "abc-001"
      When Catalog Operator gan SKU " ABC-001 " cho Variant
      Then Variant luu SKU canonical "abc-001"

    @accepted @api @SC-CAT-VARIANT-SKU-002
    Scenario: SKU da duoc Inactive Variant su dung khong duoc tai su dung
      Given Variant Inactive da reserve SKU canonical "abc-001"
      When Catalog Operator gan SKU "ABC-001" cho Variant khac
      Then he thong tu choi duplicate SKU

    @accepted @api @SC-CAT-VARIANT-SKU-003
    Scenario: SKU trim thanh empty duoc coi la absent
      Given Variant dang Active chua co SKU
      When Catalog Operator gan SKU "   " cho Variant
      Then Variant van khong co SKU

  @UC-CAT-VARIANT-READINESS
  Rule: Active Variant is not automatically sale-ready

    @accepted @api @SC-CAT-VARIANT-PRICE-001
    Scenario: Active Variant chua co SKU chua sale-ready
      Given Variant dang "Active" va chua co SKU
      When he thong danh gia commercial readiness
      Then Variant khong sale-ready

    @accepted @api @SC-CAT-VARIANT-PRICE-002
    Scenario: Variant Active co SKU va SellingPrice hop le la sale-ready
      Given Variant dang "Active" voi SKU hop le
      When Catalog Operator set SellingPrice "400000 VND"
      Then Variant la sale-ready

  @UC-CAT-VARIANT-PRICE
  Rule: SellingPrice is positive and uses catalog currency

    @accepted @api @SC-CAT-VARIANT-PRICE-003
    Scenario: Variant nhan SellingPrice dung currency catalog
      Given catalog currency la "VND"
      When Catalog Operator set SellingPrice "400000 VND"
      Then he thong luu current SellingPrice cua Variant

    @accepted @api @SC-CAT-VARIANT-PRICE-004
    Scenario: SellingPrice bang khong hoac sai currency bi tu choi
      Given catalog currency la "VND"
      When Catalog Operator set SellingPrice "0 USD"
      Then he thong tu choi SellingPrice

    @accepted @api @SC-CAT-VARIANT-PRICE-005
    Scenario: Nhieu Variant duoc cap nhat cung SellingPrice hop le
      Given Catalog Operator chon ba Variant hop le
      When Catalog Operator set SellingPrice "400000 VND" cho nhom
      Then ca ba Variant deu co SellingPrice "400000 VND"

    @accepted @api @SC-CAT-VARIANT-PRICE-006
    Scenario: Batch invalid khong cap nhat Variant nao
      Given Catalog Operator chon hai Variant
      And mot Variant trong batch khong the nhan gia yeu cau
      When Catalog Operator set SellingPrice cho nhom
      Then he thong tu choi batch
      And SellingPrice cua ca hai Variant khong thay doi

  @UC-CAT-VARIANT-PACK
  Rule: Pack is the source of truth for the selling unit

    @accepted @api @SC-CAT-VARIANT-PACK-001
    Scenario: Pack dimension xac dinh unit va quantity cua Variant
      Given Pack "Hop 10 cai" co selling unit Box, quantity 10 va base unit Piece
      And ProductModel co Pack la VariantDimension
      When Catalog Operator tao Variant chon Pack "Hop 10 cai"
      Then Variant tham chieu Pack "Hop 10 cai"
      And projection cua Variant la "Box", 10 "Piece"

    @accepted @api @SC-CAT-VARIANT-PACK-002
    Scenario: Pack inactive khong duoc gan moi nhung Variant cu van ban
      Given Variant publicly sellable tham chieu Pack "Hop 10 cai"
      And Pack "Hop 10 cai" da inactive
      When Catalog Operator tao Variant moi tham chieu Pack "Hop 10 cai"
      Then he thong tu choi Pack reference moi
      And Variant cu van publicly sellable

  @UC-CAT-VARIANT-HIGH-LEVEL
  Rule: Catalog Base high-level behavior remains traceable

    @accepted @api @SC-CAT-VARIANT-COMBINATION-012
    Scenario: Generate Selected Canonical Combinations
      Given a ProductModel has Material, Finish, and Size dimensions
      When Catalog Operator previews the available combinations
      And Catalog Operator selects a valid subset
      Then the system creates one Variant with one value for every dimension per selected combination
      When the selected subset contains an existing canonical combination
      Then the duplicate combination record is rejected

    @accepted @api @SC-CAT-VARIANT-DIMENSIONS-013
    Scenario: Configure Variant Dimensions and Values
      Given a ProductModel has a valid Variant dimension definition
      When Catalog Operator adds an allowed selectable value
      Then the value can participate in new combinations
      When Catalog Operator tries to add or remove a VariantDimension after Variants exist
      Then the structural dimension change is rejected

    @accepted @api @SC-CAT-VARIANT-LIFECYCLE-014
    Scenario: Create and Maintain Variants
      Given a ProductModel has valid Variant dimensions
      When Catalog Operator creates a Variant from one selected value per dimension
      Then the selected option identity is immutable
      When Catalog Operator inactivates the Variant
      Then the Variant is excluded from public option availability
      And its selected options remain unchanged

    @accepted @api @SC-CAT-VARIANT-TECHNICAL-015
    Scenario: Keep Variant Technical Values Outside Identity
      Given Size "300 mm" is a selected option and Weight is a variant-specific definition
      When Catalog Operator creates a Variant with Size "300 mm"
      And Catalog Operator sets Weight to "1.2 kg" on the Variant
      Then the Weight value is stored
      And the canonical combination identity is unchanged

    @accepted @api @SC-CAT-VARIANT-PRICE-007
    Scenario: Apply Bulk Selling Price Atomically
      Given Catalog Operator selects multiple Variants
      When Catalog Operator sets one valid SellingPrice for the group
      Then every selected Variant is updated
      When one selected Variant is invalid or the amount is not positive
      Then no selected Variant is updated

    @accepted @api @SC-CAT-VARIANT-COMMERCIAL-008
    Scenario: Maintain SKU SellingPrice and Pack Reference
      Given a Variant exists
      When Catalog Operator assigns a non-empty SKU, valid SellingPrice, and Pack reference
      Then the Variant is sale-ready when Active
      And SKU normalization and uniqueness are enforced
      When Catalog Operator assigns a non-positive price or a non-catalog currency
      Then the commercial update is rejected

