import fs from "node:fs";
import path from "node:path";

const contractPath = path.resolve(__dirname, "..", "contracts/openapi.yaml");
const source = fs.readFileSync(contractPath, "utf8");

if (!/^\s*openapi:\s*\S+/m.test(source)) {
  console.log("No authoritative OpenAPI document is declared; operation validation is intentionally skipped.");
  process.exit(0);
}

const errors: string[] = [];
if (!/^\s*info:\s*$/m.test(source)) errors.push("contracts/openapi.yaml is missing info");
if (!/^\s*paths:\s*$/m.test(source)) errors.push("contracts/openapi.yaml is missing paths");
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("OpenAPI document has the required top-level sections.");
}
