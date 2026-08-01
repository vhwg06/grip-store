@catalog @product
Feature: Cau hinh, lifecycle va commercial data Variant
  As a Catalog Operator
  I want tao Variant tu cac option canonical va quan ly commercial data
  So that moi to hop ban hang la duy nhat va sale-ready

  Rule: Variant chon day du dimensions bat buoc

    @domain @smoke @CAT-VARIANT-001
    Scenario: Variant duoc tao voi mot value cho moi dimension
      Given ProductModel co VariantDimensions Material, Finish va Size
      When Catalog Operator tao Variant chon mot value hop le cho moi dimension
      Then he thong tao Variant voi selected option values day du

    @domain @regression @CAT-VARIANT-002
    Scenario: Variant thieu Size khong duoc tao
      Given ProductModel co VariantDimensions Material, Finish va Size
      When Catalog Operator tao Variant khong chon Size
      Then he thong tu choi incomplete combination

  Rule: Canonical combination unique trong ProductModel

    @domain @smoke @CAT-VARIANT-003
    Scenario: Hai representation length tuong duong khong tao hai combinations
      Given ProductModel co Numeric VariantDimension Size voi unit family "length"
      And Variant da ton tai voi Size "200 mm"
      When Catalog Operator tao Variant chon Size "20 cm"
      Then he thong tu choi duplicate canonical combination

    @domain @regression @CAT-VARIANT-004
    Scenario: Cung option co the ton tai tren ProductModel khac
      Given ProductModel A co Variant Material "Inox 304", Finish "Black" va Size "200 mm"
      And ProductModel B co cung ba VariantDimensions
      When Catalog Operator tao Variant tren ProductModel B voi cung selected values
      Then he thong tao Variant tren ProductModel B

    @application @smoke @CAT-VARIANT-011
    Scenario: Generate Variant chi tao selected subset khong tao Cartesian product
      Given ProductModel co VariantDimensions Material, Finish va Size voi nhieu allowed values
      When Catalog Operator generate mot subset selected combinations
      Then he thong chi tao cac Variant duoc chon
      And he thong khong tu tao toan bo Cartesian product

  Rule: Variant technical value khong tham gia combination identity

    @domain @smoke @CAT-VARIANT-005
    Scenario: Variant luu Weight rieng sau khi chon Size
      Given ProductModel khai bao Weight la variant-specific technical attribute
      And Variant co Size selected option "300 mm"
      When Catalog Operator set Weight "1.2 kg" tren Variant
      Then he thong luu VariantAttributeValue Weight
      And combination identity cua Variant khong thay doi

    @domain @regression @CAT-VARIANT-006
    Scenario: Variant khong tu gan attribute chua khai bao variant-specific
      Given ProductModel khong khai bao Projection la variant-specific attribute
      When Catalog Operator set Projection "60 mm" tren Variant
      Then he thong tu choi VariantAttributeValue

  Rule: Dimension structure dong khi da co Variant

    @application @smoke @CAT-VARIANT-007
    Scenario: Model co Variant duoc them selectable value moi
      Given ProductModel da co Variant va co VariantDimension Finish
      When Catalog Operator them Finish value moi vao dimension
      Then he thong chap nhan selectable value moi

    @application @regression @CAT-VARIANT-008
    Scenario: Model co Variant khong duoc them dimension moi
      Given ProductModel da co it nhat mot Variant
      When Catalog Operator them VariantDimension Handing
      Then he thong tu choi structural dimension change

  Rule: Variant inactive khong tham gia public option availability

    @application @smoke @CAT-VARIANT-009
    Scenario: Inactive Variant bi loai khoi available options
      Given ProductModel Active co Variant Active va Variant Inactive khac nhau o Finish
      When customer lay available options
      Then he thong khong tra Finish chi co tren Variant Inactive

    @domain @regression @CAT-VARIANT-010
    Scenario: Variant inactive co the reactivate ma khong doi selected options
      Given Variant dang "Inactive" voi selected options bat bien
      When Catalog Operator reactivate Variant
      Then Variant chuyen sang "Active"
      And selected options van giu nguyen

  Rule: SKU non-empty unique ngay khi duoc gan

    @domain @smoke @CAT-SKU-001
    Scenario: SKU duoc trim va case-fold truoc khi luu
      Given khong co Variant nao da dung SKU canonical "abc-001"
      When Catalog Operator gan SKU " ABC-001 " cho Variant
      Then Variant luu SKU canonical "abc-001"

    @domain @regression @CAT-SKU-002
    Scenario: SKU da duoc Inactive Variant su dung khong duoc tai su dung
      Given Variant Inactive da reserve SKU canonical "abc-001"
      When Catalog Operator gan SKU "ABC-001" cho Variant khac
      Then he thong tu choi duplicate SKU

    @domain @regression @CAT-SKU-003
    Scenario: SKU trim thanh empty duoc coi la absent
      Given Variant dang Active chua co SKU
      When Catalog Operator gan SKU "   " cho Variant
      Then Variant van khong co SKU

  Rule: Active Variant khong dong nghia sale-ready

    @domain @smoke @CAT-PRICE-001
    Scenario: Active Variant chua co SKU chua sale-ready
      Given Variant dang "Active" va chua co SKU
      When he thong danh gia commercial readiness
      Then Variant khong sale-ready

    @domain @regression @CAT-PRICE-002
    Scenario: Variant Active co SKU va SellingPrice hop le la sale-ready
      Given Variant dang "Active" voi SKU hop le
      When Catalog Operator set SellingPrice "400000 VND"
      Then Variant la sale-ready

  Rule: SellingPrice la Money duong theo catalog currency

    @domain @smoke @CAT-PRICE-003
    Scenario: Variant nhan SellingPrice dung currency catalog
      Given catalog currency la "VND"
      When Catalog Operator set SellingPrice "400000 VND"
      Then he thong luu current SellingPrice cua Variant

    @domain @regression @CAT-PRICE-004
    Scenario: SellingPrice bang khong hoac sai currency bi tu choi
      Given catalog currency la "VND"
      When Catalog Operator set SellingPrice "0 USD"
      Then he thong tu choi SellingPrice

  Rule: Bulk SellingPrice update la atomic

    @application @smoke @CAT-PRICE-005
    Scenario: Nhieu Variant duoc cap nhat cung SellingPrice hop le
      Given Catalog Operator chon ba Variant hop le
      When Catalog Operator set SellingPrice "400000 VND" cho nhom
      Then ca ba Variant deu co SellingPrice "400000 VND"

    @application @regression @CAT-PRICE-006
    Scenario: Batch invalid khong cap nhat Variant nao
      Given Catalog Operator chon hai Variant
      And mot Variant trong batch khong the nhan gia yeu cau
      When Catalog Operator set SellingPrice cho nhom
      Then he thong tu choi batch
      And SellingPrice cua ca hai Variant khong thay doi

  Rule: Pack master la nguon su that cua selling unit

    @domain @smoke @CAT-PACK-001
    Scenario: Pack dimension xac dinh unit va quantity cua Variant
      Given Pack "Hop 10 cai" co selling unit Box, quantity 10 va base unit Piece
      And ProductModel co Pack la VariantDimension
      When Catalog Operator tao Variant chon Pack "Hop 10 cai"
      Then Variant tham chieu Pack "Hop 10 cai"
      And projection cua Variant la "Box", 10 "Piece"

    @domain @regression @CAT-PACK-002
    Scenario: Pack inactive khong duoc gan moi nhung Variant cu van ban
      Given Variant publicly sellable tham chieu Pack "Hop 10 cai"
      And Pack "Hop 10 cai" da inactive
      When Catalog Operator tao Variant moi tham chieu Pack "Hop 10 cai"
      Then he thong tu choi Pack reference moi
      And Variant cu van publicly sellable

