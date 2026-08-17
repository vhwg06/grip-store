import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { codexInvocation, terminationPlan } from "./process";

test("macOS/Linux Codex phases start in their own process group", () => {
  const mac = codexInvocation(["exec", "--json"], "darwin", { CODEX_BIN: "/usr/local/bin/codex" });
  const linux = codexInvocation(["exec", "--json"], "linux", { CODEX_BIN: "/usr/bin/codex" });

  assert.equal(mac.command, "/usr/local/bin/codex");
  assert.equal(mac.detached, true);
  assert.equal(linux.command, "/usr/bin/codex");
  assert.equal(linux.detached, true);
});

test("POSIX termination targets the whole process group", () => {
  assert.deepEqual(terminationPlan(4321, false, "darwin"), {
    kind: "posix-process-group",
    pid: -4321,
    signal: "SIGTERM",
  });
  assert.deepEqual(terminationPlan(4321, true, "linux"), {
    kind: "posix-process-group",
    pid: -4321,
    signal: "SIGKILL",
  });
});

test("Windows termination uses taskkill /T and escalates with /F", () => {
  assert.deepEqual(terminationPlan(4321, false, "win32"), {
    kind: "windows-tree",
    command: "taskkill",
    args: ["/PID", "4321", "/T"],
  });
  assert.deepEqual(terminationPlan(4321, true, "win32"), {
    kind: "windows-tree",
    command: "taskkill",
    args: ["/PID", "4321", "/T", "/F"],
  });
});

test("Windows npm Codex shim is resolved to its JS entry point instead of cmd.exe", () => {
  const root = join(tmpdir(), `figma-harness-codex-${process.pid}-${Date.now()}`);
  const bin = join(root, "npm");
  const target = join(bin, "node_modules", "@openai", "codex", "bin", "codex.js");
  mkdirSync(join(bin, "node_modules", "@openai", "codex", "bin"), { recursive: true });
  writeFileSync(target, "console.log('codex fixture');\n", "utf8");
  writeFileSync(
    join(bin, "codex.cmd"),
    '@ECHO off\r\n"%dp0%\\node.exe"  "%dp0%\\node_modules\\@openai\\codex\\bin\\codex.js" %*\r\n',
    "utf8",
  );

  const invocation = codexInvocation(["exec", "prompt & still an argv"], "win32", {
    PATH: bin,
  });

  assert.equal(invocation.command, process.execPath);
  assert.equal(invocation.detached, false);
  assert.equal(invocation.windowsHide, true);
  assert.equal(invocation.args[0], target);
  assert.deepEqual(invocation.args.slice(1), ["exec", "prompt & still an argv"]);
});
