@catalog @product-model
Feature: Catalog Base ProductModel
  As a Catalog Operator
  I want to manage ProductModel definitions and lifecycle
  So that the public catalog preserves catalog invariants

  @UC-CAT-MODEL-SCOPE
  Rule: ProductModel definitions have explicit scopes

    @accepted @api @SC-CAT-MODEL-001
    Scenario: Model khai bao fixed, dimension va variant-specific definitions rieng biet
      Given ProductModel Draft "Tay keo A"
      When Catalog Operator gan Material la fixed value, Size la VariantDimension va Weight la variant-specific definition
      Then he thong luu ba Attribute Definition o ba scope khac nhau

    @accepted @api @SC-CAT-MODEL-002
    Scenario: Definition fixed khong the dong thoi tro thanh VariantDimension
      Given ProductModel co "Material" la fixed model value
      When Catalog Operator them VariantDimension "Material"
      Then he thong tu choi scope conflict

  @UC-CAT-MODEL-MEDIA
  Rule: Primary model image is required for publication

    @accepted @api @SC-CAT-MODEL-003
    Scenario: ProductModel Draft co primary model image co the duoc publish khi cac dieu kien khac du
      Given ProductModel Draft co name, Category, primary model image va mot sale-ready Variant
      When Catalog Operator publish ProductModel
      Then ProductModel chuyen sang "Active"

    @accepted @api @SC-CAT-MODEL-004
    Scenario: Active ProductModel khong the mat primary model image
      Given ProductModel Active chi co mot primary model image
      When Catalog Operator remove primary model image ma khong dat image thay the
      Then he thong tu choi command
      And ProductModel van giu primary model image cu

    @accepted @api @SC-CAT-MODEL-012
    Scenario: ProductModel luu media theo ordering va tach primary image
      Given ProductModel Draft ton tai
      When Catalog Operator luu hai model image voi mot primary image va ordering 1, 2
      Then ProductModel luu media dung ordering
      And primary image khong la technical hoac Variant image

    @accepted @api @SC-CAT-MODEL-013
    Scenario: ProductModel luu numeric measurement voi unit compatible
      Given ProductModel Draft ton tai
      When Catalog Operator set Overall length "200 mm"
      Then ProductModel luu measurement voi canonical unit cua length

  @UC-CAT-MODEL-LIFECYCLE
  Rule: ProductModel follows one publication state machine

    @accepted @api @SC-CAT-MODEL-005
    Scenario: ProductModel Active unpublish thanh Inactive
      Given ProductModel dang "Active"
      When Catalog Operator unpublish ProductModel
      Then ProductModel chuyen sang "Inactive"

    @accepted @api @SC-CAT-MODEL-006
    Scenario: ProductModel Inactive du dieu kien publish lai thanh Active
      Given ProductModel dang "Inactive" va du dieu kien publish
      When Catalog Operator publish ProductModel du dieu kien
      Then ProductModel chuyen sang "Active"

    @accepted @api @SC-CAT-MODEL-007
    Scenario: ProductModel Discontinued khong the publish lai
      Given ProductModel da "Discontinued"
      When Catalog Operator publish ProductModel
      Then he thong tu choi transition terminal

  @UC-CAT-MODEL-INVARIANTS
  Rule: Active ProductModel keeps publication invariants

    @accepted @api @SC-CAT-MODEL-008
    Scenario: Active ProductModel giu lai sale-ready Variant cuoi cung
      Given ProductModel Active chi co mot sale-ready Variant
      When Catalog Operator inactivate Variant do
      Then he thong tu choi command
      And ProductModel van co mot sale-ready Variant

    @accepted @api @SC-CAT-MODEL-009
    Scenario: Admin unpublish truoc khi sua doi lam mat sale readiness
      Given ProductModel Active chi co mot sale-ready Variant
      When Catalog Operator unpublish ProductModel
      And Catalog Operator xoa SellingPrice cua Variant
      Then ProductModel giu trang thai "Inactive"
      And Variant khong con sale-ready

  @UC-CAT-MODEL-WARRANTY
  Rule: Warranty Summary is catalog metadata

    @accepted @api @SC-CAT-MODEL-010
    Scenario: Warranty Summary luu term va ghi chu tren ProductModel
      Given ProductModel Draft ton tai
      When Catalog Operator set warranty term "24 thang" va ghi chu "Bao hanh co khi"
      Then ProductModel hien thi Warranty Summary da luu

    @accepted @api @SC-CAT-MODEL-011
    Scenario: Warranty Summary khong tao Variant override hay claim
      Given ProductModel co Warranty Summary "24 thang"
      When customer xem ProductModel
      Then customer chi nhan Warranty Summary cua ProductModel
      And khong co warranty claim state trong catalog projection

  @UC-CAT-MODEL-CATEGORY
  Rule: Category deactivation is non-destructive

    @accepted @api @SC-CAT-MODEL-014
    Scenario: Deactivate Category Without Breaking Existing Model
      Given an Inactive ProductModel references an inactive Category
      When Catalog Operator deactivates the Category
      And Catalog Operator republishes the existing ProductModel with valid publication invariants
      Then the ProductModel is published successfully
      And new ProductModel assignment to the inactive Category is rejected

  @UC-CAT-MODEL-ATTRIBUTES
  Rule: Used attribute definitions keep their semantic structure

    @accepted @api @SC-CAT-MODEL-015
    Scenario: Preserve Used Attribute Structure
      Given a numeric attribute Overall length is already used by a ProductModel
      When Catalog Operator changes its display name
      Then the new display metadata is saved
      When Catalog Operator changes the numeric definition to text
      Then the semantic structure change is rejected
      When Catalog Operator changes its unit family
      Then the incompatible unit-family change is rejected

    @accepted @api @SC-CAT-MODEL-016
    Scenario: Maintain Material Finish and Pack Masters
      Given Material, Finish, and Pack are catalog master references
      When Catalog Operator updates their display metadata
      Then the master metadata is stored
      When Catalog Operator deactivates a master reference
      Then new assignment is rejected
      And existing ProductModel and Variant references remain valid

  @UC-CAT-MODEL-CONTENT
  Rule: ProductModel content remains owned by ProductModel

    @accepted @api @SC-CAT-MODEL-017
    Scenario: Build Draft With Distinct Attribute Scopes
      Given Catalog Operator creates ProductModel "Tay keo A"
      When Catalog Operator sets Material as a fixed model value
      And Catalog Operator sets Size as a VariantDimension
      And Catalog Operator declares Weight as a variant-specific technical attribute
      Then the ProductModel accepts the three non-overlapping attribute scopes
      When Catalog Operator uses one definition as both fixed and dimension scope
      Then the scope conflict is rejected

    @accepted @api @SC-CAT-MODEL-018
    Scenario: Maintain ProductModel Media Description and Warranty
      Given a ProductModel exists
      When Catalog Operator adds, orders, and selects its primary model image
      And Catalog Operator updates the ProductModel description and WarrantySummary
      Then the content is stored in the ProductModel context
      And WarrantySummary contains a required term and an optional note

    @accepted @api @SC-CAT-MODEL-019
    Scenario: Enforce ProductModel Publication State Machine
      Given a ProductModel exists in Draft, Active, Inactive, or Discontinued state
      When Catalog Operator requests a valid publish, unpublish, or discontinue transition
      Then the ProductModel enters the requested state
      And Discontinued remains terminal
      When Catalog Operator requests a transition that breaks the lifecycle rules
      Then the transition is rejected

  @UC-CAT-MODEL-PUBLICATION
  Rule: Active ProductModel publication invariants are preserved

    @accepted @api @SC-CAT-MODEL-020
    Scenario: Reject Mutation That Breaks Active Model
      Given an Active ProductModel has one sale-ready Variant and one primary model image
      When Catalog Operator tries to inactivate the last sale-ready Variant
      Then the command is rejected
      When Catalog Operator tries to remove the last primary model image
      Then the command is rejected
      When Catalog Operator unpublishes the ProductModel before editing
      Then the ProductModel can be edited and republished after its invariants are restored

  @UC-CAT-MODEL-PUBLIC-QUERY
  Rule: Public projection resolves only publicly sellable catalog data

    @accepted @api @SC-CAT-MODEL-021
    Scenario: Resolve Only Publicly Sellable Variant
      Given an Active ProductModel has one Active sale-ready Variant and one Inactive Variant
      When Customer selects a valid option combination
      Then available options contain only options from publicly sellable Variants
      When Customer resolves the exact selected combination
      Then the Inactive Variant is not returned as a public result

