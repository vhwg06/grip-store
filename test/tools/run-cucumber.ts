import { spawnSync } from "node:child_process";
import path from "node:path";

const mode = process.argv[2];
const value = process.argv[3];
const cucumberBin = path.resolve(__dirname, "../node_modules/.bin/cucumber-js");
const args = ["--config", "cucumber.config.ts"];

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
  case "browser":
    args.push("--tags", "@accepted and @browser");
    break;
  default:
    throw new Error("Usage: run-cucumber.ts <scenario|module|acceptance|api|browser> [value]");
}

const result = spawnSync(cucumberBin, args, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
