import assert from "node:assert/strict";
import test from "node:test";

import { decideAfterReview, maximumReviewCount } from "./lifecycle";

test("a failed final review stops instead of scheduling an unverified repair", () => {
  const maxRepairs = 3;

  assert.equal(decideAfterReview(false, 0, maxRepairs), "repair");
  assert.equal(decideAfterReview(false, 1, maxRepairs), "repair");
  assert.equal(decideAfterReview(false, 2, maxRepairs), "repair");
  assert.equal(decideAfterReview(false, 3, maxRepairs), "fail_budget");
});

test("three repair opportunities imply four independent reviews", () => {
  assert.equal(maximumReviewCount(3), 4);
});

test("a passing review terminates immediately regardless of remaining repair budget", () => {
  assert.equal(decideAfterReview(true, 0, 3), "pass");
  assert.equal(decideAfterReview(true, 3, 3), "pass");
});
