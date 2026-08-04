@catalog @master-data
Feature: Catalog master data
  As a Catalog Operator
  I want to maintain catalog vocabulary and classification
  So that ProductModel and Variant use stable typed references

  @UC-CAT-MASTER-CATEGORY
  Rule: Category is classification with a non-destructive lifecycle

    @deferred @api @SC-CAT-MASTER-CATEGORY-001
    Scenario: Deactivate Category Without Breaking Existing Model
      Given an existing ProductModel references a Category
      When Catalog Operator deactivates that Category
      Then new ProductModel assignment to that Category is rejected
      And the existing ProductModel reference remains valid for republishing

  @UC-CAT-MASTER-ATTRIBUTE
  Rule: Attribute definitions have one typed semantic shape

    @deferred @api @SC-CAT-MASTER-ATTRIBUTE-001
    Scenario: Reject meaningless attribute type combinations
      When Catalog Operator defines a Reference attribute with a numeric data type
      Then the attribute definition is rejected
      When Catalog Operator defines a numeric Scalar attribute with an incompatible unit
      Then the attribute definition is rejected

    @deferred @api @SC-CAT-MASTER-ATTRIBUTE-002
    Scenario: Preserve used attribute semantic structure
      Given a numeric attribute definition is used by a ProductModel
      When Catalog Operator changes its display name, description, or ordering
      Then the display metadata is saved
      When Catalog Operator changes its value kind, data type, reference target, or unit family
      Then the semantic structure change is rejected

  @UC-CAT-MASTER-REFERENCE
  Rule: Reference masters are the only assignment source for their values

    @deferred @api @SC-CAT-MASTER-REFERENCE-001
    Scenario: Deactivate Material Finish or Pack without rewriting existing references
      Given Material, Finish, and Pack are referenced by existing catalog data
      When Catalog Operator deactivates one master reference
      Then new assignment of that reference is rejected
      And existing ProductModel and Variant references remain valid

  @UC-CAT-MASTER-PACK
  Rule: Pack owns selling-unit metadata

    @deferred @api @SC-CAT-MASTER-PACK-001
    Scenario: Maintain Pack as the source of truth for selling unit
      Given a Pack has selling unit, quantity, and base unit metadata
      When Catalog Operator updates the Pack display metadata
      Then the Pack keeps its selling-unit metadata as the referenced source of truth
