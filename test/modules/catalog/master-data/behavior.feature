@catalog @master-data
Feature: Catalog master data
  As a Catalog Operator
  I want to maintain catalog vocabulary and classification
  So that ProductModel and Variant use stable typed references

  @UC-CAT-MASTER-CATEGORY
  Rule: Category is classification with a non-destructive lifecycle

    @accepted @api @SC-CAT-MASTER-CATEGORY-002
    Scenario: Maintain Category hierarchy without assigning product rules
      Given the Catalog Operator has catalog master-data access
      When Catalog Operator creates a root Category and a child Category
      And Catalog Operator changes the root Category position to `9`
      Then the Category read model preserves classification hierarchy and position
      And the Category does not own an attribute template or publication rule

    @accepted @api @SC-CAT-MASTER-CATEGORY-001
    Scenario: Deactivate Category Without Breaking Existing Model
      Given an existing ProductModel references a Category
      When Catalog Operator deactivates that Category
      Then new ProductModel assignment to that Category is rejected
      And the existing ProductModel reference remains valid for republishing

    @accepted @api @SC-CAT-MASTER-CATEGORY-003
    Scenario: Category deactivation is not deletion
      Given an existing ProductModel references a Category
      When Catalog Operator deactivates that Category
      Then Category deletion is rejected
      And the existing ProductModel reference remains readable

  @UC-CAT-MASTER-ATTRIBUTE
  Rule: Attribute definitions have one typed semantic shape

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-003
    Scenario: Store a valid Scalar Number definition with a compatible unit
      Given the Catalog Operator has catalog master-data access
      When Catalog Operator defines a valid Scalar Number attribute with a compatible unit
      Then the attribute definition is stored with its typed semantic fields

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-004
    Scenario: Store a valid Enum definition and selectable values
      Given the Catalog Operator has catalog master-data access
      When Catalog Operator defines a valid Enum attribute with selectable values
      Then the attribute definition is stored with its typed semantic fields
      And Enum values can be deactivated without deleting historical references

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-005
    Scenario: Store a valid Reference definition with one target
      Given the Catalog Operator has catalog master-data access
      When Catalog Operator defines a valid Reference attribute targeting Material, Finish, or Pack
      Then the definition exposes exactly one reference target

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-001
    Scenario: Reject meaningless attribute type combinations
      When Catalog Operator defines a Reference attribute with a numeric data type
      Then the attribute definition is rejected
      When Catalog Operator defines a numeric Scalar attribute with an incompatible unit
      Then the attribute definition is rejected

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-002
    Scenario: Preserve used attribute semantic structure
      Given a numeric attribute definition is used by a ProductModel
      When Catalog Operator changes its display name, description, or ordering
      Then the display metadata is saved
      When Catalog Operator changes its value kind, data type, reference target, or unit family
      Then the Catalog Base semantic structure change is rejected

    @accepted @api @SC-CAT-MASTER-ATTRIBUTE-006
    Scenario: Deactivate a used attribute definition without rewriting data
      Given a numeric attribute definition is used by a ProductModel
      When Catalog Operator deactivates the used attribute definition
      Then new ProductModel assignment to the definition is rejected
      And existing ProductModel values remain readable

  @UC-CAT-MASTER-REFERENCE
  Rule: Reference masters are the only assignment source for their values

    @accepted @api @SC-CAT-MASTER-REFERENCE-001
    Scenario: Deactivate Material Finish or Pack without rewriting existing references
      Given Material, Finish, and Pack are referenced by existing catalog data
      When Catalog Operator deactivates one master reference
      Then new assignment of that reference is rejected
      And existing ProductModel and Variant references remain valid after master deactivation

    @accepted @api @SC-CAT-MASTER-REFERENCE-002
    Scenario: Finish owns display metadata and swatch media
      Given the Catalog Operator has catalog master-data access
      When Catalog Operator updates Finish display metadata and swatch media
      Then the Finish master exposes its saved swatch media

  @UC-CAT-MASTER-PACK
  Rule: Pack owns selling-unit metadata

    @accepted @api @SC-CAT-MASTER-PACK-001
    Scenario: Maintain Pack as the source of truth for selling unit
      Given a Pack has selling unit, quantity, and base unit metadata
      When Catalog Operator updates the Pack display metadata
      Then the Pack keeps its selling-unit metadata as the referenced source of truth

    @accepted @api @SC-CAT-MASTER-PACK-002
    Scenario: Pack metadata remains distinct from stock and quantity pricing
      Given a Pack has selling unit, quantity, and base unit metadata
      When Catalog Operator updates the Pack quantity or base unit
      Then the Pack projection changes its selling-unit metadata
      And the Catalog Base does not create stock or quantity-price state
