import { spawnSync } from "node:child_process";
import path from "node:path";

const mode = process.argv[2];
const value = process.argv[3];
const cucumberBin = path.resolve(__dirname, "../node_modules/.bin/cucumber-js");
const args = ["--config", "cucumber.config.cjs"];
const extraArgs = mode === "scenario" || mode === "module"
  ? process.argv.slice(4)
  : process.argv.slice(3);

switch (mode) {
  case "scenario": {
    if (!value) throw new Error("Usage: npm run test:scenario -- SCENARIO-ID");
    const id = value.startsWith("@") ? value : `@${value}`;
    args.push("--tags", id);
    break;
  }
  case "module": {
    if (!value) throw new Error("Usage: npm run test:module -- catalog/product-model");
    const feature = value.endsWith(".feature") ? value : `${value.replace(/^modules\//, "").replace(/\/$/, "")}/behavior.feature`;
    args.push(path.join("modules", feature), "--tags", "@accepted");
    break;
  }
  case "acceptance":
    args.push("--tags", "@accepted");
    break;
  case "api":
    args.push("--tags", "@accepted and @api");
    break;
  case "api-non-catalog":
    args.push("--tags", "@accepted and @api and not @catalog");
    break;
  case "catalog":
    args.push("--tags", "@accepted and @catalog");
    break;
  case "browser":
    args.push("--tags", "@accepted and @browser");
    break;
  case "browser-non-catalog":
    args.push("--tags", "@accepted and @browser and not @catalog");
    break;
  default:
    throw new Error(
      "Usage: run-cucumber.ts <scenario|module|acceptance|api|api-non-catalog|catalog|browser|browser-non-catalog> [value]",
  );
}

args.push(...extraArgs);

const result = spawnSync(cucumberBin, args, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
