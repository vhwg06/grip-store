import { Before } from "@cucumber/cucumber";
import type { ScenarioWorld } from "../../../shared/cucumber/world";

Before(function (this: ScenarioWorld) {
  if (this.scenarioBinding?.module !== "inventory.stock") return;
  this.activeModule = "inventory.stock";
});
