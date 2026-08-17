import assert from "node:assert/strict";
import test from "node:test";

import { codexTerminalFailure, supervisionTimeoutReason } from "./supervision";

test("a phase is not failed merely because it has run for 45 minutes", () => {
  const start = 0;
  const fourHours = 4 * 60 * 60 * 1000;
  const fortyFiveMinutes = 45 * 60 * 1000;

  assert.equal(supervisionTimeoutReason(fortyFiveMinutes, start, fourHours, 0), null);
});

test("configured idle timeout is based on last child activity, not phase age", () => {
  const tenMinutes = 10 * 60 * 1000;
  const now = 45 * 60 * 1000;
  const lastActivity = now - 60 * 1000;

  assert.equal(supervisionTimeoutReason(now, lastActivity, 4 * 60 * 60 * 1000, tenMinutes), null);
  assert.equal(
    supervisionTimeoutReason(now, now - tenMinutes, 4 * 60 * 60 * 1000, tenMinutes),
    "idle",
  );
});

test("whole-run deadline remains the hard safety ceiling", () => {
  const deadline = 4 * 60 * 60 * 1000;
  assert.equal(supervisionTimeoutReason(deadline, deadline - 1, deadline, 0), "run");
});

test("Codex turn.failed is treated as a terminal stream failure even if the process could exit zero", () => {
  const events = [
    JSON.stringify({ type: "thread.started", thread_id: "abc" }),
    JSON.stringify({ type: "turn.started" }),
    JSON.stringify({ type: "turn.failed", error: { message: "sandbox setup failed" } }),
  ].join("\n");

  assert.match(codexTerminalFailure(events) ?? "", /turn\.failed.*sandbox setup failed/);
});

test("a later turn.completed clears a recoverable prior error event", () => {
  const events = [
    JSON.stringify({ type: "error", message: "transient" }),
    JSON.stringify({ type: "turn.completed" }),
  ].join("\n");

  assert.equal(codexTerminalFailure(events), null);
});
