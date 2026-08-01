@catalog @product
Feature: Noi dung va lifecycle ProductModel
  As a Catalog Operator
  I want quan ly ProductModel va publication lifecycle
  So that catalog cong khai luon day du va co the ban

  Rule: Moi Attribute Definition cua ProductModel chi thuoc mot scope

    @domain @smoke @CAT-MODEL-001
    Scenario: Model khai bao fixed, dimension va variant-specific definitions rieng biet
      Given ProductModel Draft "Tay keo A"
      When Catalog Operator gan Material la fixed value, Size la VariantDimension va Weight la variant-specific definition
      Then he thong luu ba Attribute Definition o ba scope khac nhau

    @domain @regression @CAT-MODEL-002
    Scenario: Definition fixed khong the dong thoi tro thanh VariantDimension
      Given ProductModel co "Material" la fixed model value
      When Catalog Operator them VariantDimension "Material"
      Then he thong tu choi scope conflict

  Rule: Primary model image la dieu kien publication bat buoc

    @domain @smoke @CAT-MODEL-003
    Scenario: ProductModel Draft co primary model image co the duoc publish khi cac dieu kien khac du
      Given ProductModel Draft co name, Category, primary model image va mot sale-ready Variant
      When Catalog Operator publish ProductModel
      Then ProductModel chuyen sang "Active"

    @domain @regression @CAT-MODEL-004
    Scenario: Active ProductModel khong the mat primary model image
      Given ProductModel Active chi co mot primary model image
      When Catalog Operator remove primary model image ma khong dat image thay the
      Then he thong tu choi command
      And ProductModel van giu primary model image cu

    @application @smoke @CAT-MODEL-012
    Scenario: ProductModel luu media theo ordering va tach primary image
      Given ProductModel Draft ton tai
      When Catalog Operator luu hai model image voi mot primary image va ordering 1, 2
      Then ProductModel luu media dung ordering
      And primary image khong la technical hoac Variant image

    @application @regression @CAT-MODEL-013
    Scenario: ProductModel luu numeric measurement voi unit compatible
      Given ProductModel Draft ton tai
      When Catalog Operator set Overall length "200 mm"
      Then ProductModel luu measurement voi canonical unit cua length

  Rule: ProductModel dung mot publication state machine

    @domain @smoke @CAT-MODEL-005
    Scenario: ProductModel Active unpublish thanh Inactive
      Given ProductModel dang "Active"
      When Catalog Operator unpublish ProductModel
      Then ProductModel chuyen sang "Inactive"

    @domain @smoke @CAT-MODEL-006
    Scenario: ProductModel Inactive du dieu kien publish lai thanh Active
      Given ProductModel dang "Inactive" va du dieu kien publish
      When Catalog Operator publish ProductModel du dieu kien
      Then ProductModel chuyen sang "Active"

    @domain @regression @CAT-MODEL-007
    Scenario: ProductModel Discontinued khong the publish lai
      Given ProductModel da "Discontinued"
      When Catalog Operator publish ProductModel
      Then he thong tu choi transition terminal

  Rule: Active ProductModel luon giu publication invariants

    @domain @smoke @CAT-MODEL-008
    Scenario: Active ProductModel giu lai sale-ready Variant cuoi cung
      Given ProductModel Active chi co mot sale-ready Variant
      When Catalog Operator inactivate Variant do
      Then he thong tu choi command
      And ProductModel van co mot sale-ready Variant

    @domain @regression @CAT-MODEL-009
    Scenario: Admin unpublish truoc khi sua doi lam mat sale readiness
      Given ProductModel Active chi co mot sale-ready Variant
      When Catalog Operator unpublish ProductModel
      And Catalog Operator xoa SellingPrice cua Variant
      Then ProductModel giu trang thai "Inactive"
      And Variant khong con sale-ready

  Rule: Warranty Summary chi la catalog metadata

    @application @smoke @CAT-MODEL-010
    Scenario: Warranty Summary luu term va ghi chu tren ProductModel
      Given ProductModel Draft ton tai
      When Catalog Operator set warranty term "24 thang" va ghi chu "Bao hanh co khi"
      Then ProductModel hien thi Warranty Summary da luu

    @application @regression @CAT-MODEL-011
    Scenario: Warranty Summary khong tao Variant override hay claim
      Given ProductModel co Warranty Summary "24 thang"
      When customer xem ProductModel
      Then customer chi nhan Warranty Summary cua ProductModel
      And khong co warranty claim state trong catalog projection
