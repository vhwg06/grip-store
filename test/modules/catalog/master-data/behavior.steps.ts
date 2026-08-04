import { Before, Given, Then, When } from "@cucumber/cucumber";
import type { ScenarioWorld } from "../../../shared/cucumber/world";

function deferred(): never {
  throw new Error("Catalog master-data API operations are deferred pending canonical OpenAPI.");
}

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "catalog.master-data") return;
  this.activeModule = "catalog.master-data";
});

Given("an existing ProductModel references a Category", deferred);
When("Catalog Operator deactivates that Category", deferred);
Then("new ProductModel assignment to that Category is rejected", deferred);
Then("the existing ProductModel reference remains valid for republishing", deferred);
When("Catalog Operator defines a Reference attribute with a numeric data type", deferred);
Then("the attribute definition is rejected", deferred);
When("Catalog Operator defines a numeric Scalar attribute with an incompatible unit", deferred);
Given("a numeric attribute definition is used by a ProductModel", deferred);
When("Catalog Operator changes its display name, description, or ordering", deferred);
Then("the display metadata is saved", deferred);
When("Catalog Operator changes its value kind, data type, reference target, or unit family", deferred);
Then("the semantic structure change is rejected", deferred);
Given("Material, Finish, and Pack are referenced by existing catalog data", deferred);
When("Catalog Operator deactivates one master reference", deferred);
Then("new assignment of that reference is rejected", deferred);
Then("existing ProductModel and Variant references remain valid", deferred);
Given("a Pack has selling unit, quantity, and base unit metadata", deferred);
When("Catalog Operator updates the Pack display metadata", deferred);
Then("the Pack keeps its selling-unit metadata as the referenced source of truth", deferred);

Given("the Catalog Operator has catalog master-data access", deferred);
When("Catalog Operator creates a root Category and a child Category", deferred);
When("Catalog Operator changes the root Category position to `9`", deferred);
Then("the Category read model preserves classification hierarchy and position", deferred);
Then("the Category does not own an attribute template or publication rule", deferred);
Then("Category deletion is rejected", deferred);
Then("the existing ProductModel reference remains readable", deferred);
When("Catalog Operator defines a valid Scalar Number attribute with a compatible unit", deferred);
Then("the attribute definition is stored with its typed semantic fields", deferred);
When("Catalog Operator defines a valid Enum attribute with selectable values", deferred);
Then("Enum values can be deactivated without deleting historical references", deferred);
When("Catalog Operator defines a valid Reference attribute targeting Material, Finish, or Pack", deferred);
Then("the definition exposes exactly one reference target", deferred);
When("Catalog Operator deactivates the used attribute definition", deferred);
Then("new ProductModel assignment to the definition is rejected", deferred);
Then("existing ProductModel values remain readable", deferred);
When("Catalog Operator updates Finish display metadata and swatch media", deferred);
Then("the Finish master exposes its saved swatch media", deferred);
When("Catalog Operator updates the Pack quantity or base unit", deferred);
Then("the Pack projection changes its selling-unit metadata", deferred);
Then("the Catalog Base does not create stock or quantity-price state", deferred);
