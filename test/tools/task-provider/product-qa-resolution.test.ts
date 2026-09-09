import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("canonical Product QA task resolves through Task Provider", () => {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(
    npm,
    ["run", "task", "--", "--task", "figma-product-qa", "--dry-run"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
    },
  );

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  assert.equal(result.status, 0, output);
  assert.match(output, /task=figma-product-qa/i);
  assert.match(output, /pipeline=figma-product-qa/i);
  assert.match(output, /resolver=checkpoint/i);
  assert.match(output, /policy=product-qa/i);
  assert.match(output, /checkpoint=P003-business-solutions/i);
  assert.match(output, /plan=product-qa-v1 \(Product QA \/ Design Review\)/i);
  assert.match(output, /DRY_RUN PASS/i);
});
