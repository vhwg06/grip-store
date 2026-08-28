import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReconciliationPlan,
  orderedDocs,
  parseReconciliationManifest,
} from "./reconciliation";

const manifestInput = {
  version: 1,
  name: "vertical-backfill",
  roots: [
    {
      root: "Catalog",
      action: "patch",
      scope: "Catalog canonical root — vertical reconciliation",
      docs: {
        semantics: ["catalog-srs.md", "promotions-srs.md"],
        baseUiUx: ["catalog-public.md", "catalog-admin.md"],
        deltaUiUx: ["promotions-public.md", "promotions-admin.md"],
        references: ["promotions-research.md"],
      },
    },
    {
      root: "Aftersales",
      action: "verify",
      scope: "Aftersales canonical root — vertical impact verification",
      docs: {
        semantics: ["aftersales-srs.md", "aftersales-audit.md"],
        baseUiUx: ["aftersales-public.md", "aftersales-admin.md"],
        deltaUiUx: [],
      },
    },
  ],
};

test("document authority order is semantics, existing UI/UX base, delta, then reference evidence", () => {
  const manifest = parseReconciliationManifest(manifestInput);
  assert.deepEqual(orderedDocs(manifest.roots[0].docs), [
    "catalog-srs.md",
    "promotions-srs.md",
    "catalog-public.md",
    "catalog-admin.md",
    "promotions-public.md",
    "promotions-admin.md",
    "promotions-research.md",
  ]);
});

test("patch roots become one write lifecycle while no-patch roots become verification-only", () => {
  const manifest = parseReconciliationManifest(manifestInput);
  const plan = buildReconciliationPlan(manifest, 3);

  assert.equal(plan[0].root, "Catalog");
  assert.equal(plan[0].mode, "write");
  assert.equal(plan[0].maxRepairs, 3);

  assert.equal(plan[1].root, "Aftersales");
  assert.equal(plan[1].mode, "verify");
  assert.equal(plan[1].maxRepairs, 0);
});

test("root filtering supports explicit resume without rerunning already completed roots", () => {
  const manifest = parseReconciliationManifest(manifestInput);
  const plan = buildReconciliationPlan(manifest, 3, ["Aftersales"]);
  assert.deepEqual(plan.map((item) => item.root), ["Aftersales"]);
});

test("duplicate canonical roots are rejected", () => {
  assert.throws(
    () => parseReconciliationManifest({
      ...manifestInput,
      roots: [manifestInput.roots[0], { ...manifestInput.roots[0], root: "catalog" }],
    }),
    /duplicate reconciliation root/i,
  );
});

test("duplicate documents across authority buckets are rejected", () => {
  assert.throws(
    () => parseReconciliationManifest({
      version: 1,
      name: "bad-docs",
      roots: [{
        root: "Catalog",
        action: "patch",
        scope: "Catalog",
        docs: {
          semantics: ["same.md"],
          baseUiUx: ["same.md"],
          deltaUiUx: ["delta.md"],
        },
      }],
    }),
    /same document more than once/i,
  );
});

test("verify roots cannot silently gain a repair budget", () => {
  assert.throws(
    () => parseReconciliationManifest({
      version: 1,
      name: "bad-verify",
      roots: [{
        root: "Aftersales",
        action: "verify",
        scope: "Aftersales",
        maxRepairs: 1,
        docs: {
          semantics: ["srs.md"],
          baseUiUx: ["ux.md"],
          deltaUiUx: [],
        },
      }],
    }),
    /cannot have a repair budget/i,
  );
});
