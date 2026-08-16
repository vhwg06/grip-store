import assert from "node:assert/strict";
import test from "node:test";

import {
  decideAfterVerification,
  initialWriterRequired,
  maximumReviewCount,
} from "./lifecycle";

test("a failed final review stops instead of scheduling an unverified repair", () => {
  const maxRepairs = 3;

  assert.equal(decideAfterVerification(false, "write", 0, maxRepairs), "repair");
  assert.equal(decideAfterVerification(false, "write", 1, maxRepairs), "repair");
  assert.equal(decideAfterVerification(false, "write", 2, maxRepairs), "repair");
  assert.equal(decideAfterVerification(false, "write", 3, maxRepairs), "fail_budget");
});

test("the shared repair budget stops any verifier from scheduling repair N+1", () => {
  assert.equal(decideAfterVerification(false, "write", 3, 3), "fail_budget");
});

test("three repair opportunities imply at most four independent reviews in write mode", () => {
  assert.equal(maximumReviewCount("write", 3), 4);
});

test("a passing verification terminates immediately regardless of remaining repair budget", () => {
  assert.equal(decideAfterVerification(true, "write", 0, 3), "pass");
  assert.equal(decideAfterVerification(true, "write", 3, 3), "pass");
  assert.equal(decideAfterVerification(true, "verify", 0, 0), "pass");
});

test("verification-only mode never starts a writer or schedules a repair", () => {
  assert.equal(initialWriterRequired("verify"), false);
  assert.equal(maximumReviewCount("verify", 0), 1);
  assert.equal(decideAfterVerification(false, "verify", 0, 0), "fail_verification");
});

test("write mode starts the initial writer lifecycle", () => {
  assert.equal(initialWriterRequired("write"), true);
});
