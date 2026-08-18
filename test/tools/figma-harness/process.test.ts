import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { codexInvocation, mcpApprovalConfigArgs, shellInvocation, terminationPlan } from "./process";

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

test("Windows Codex shell launcher runs through Git Bash", () => {
  const root = join(tmpdir(), `figma-harness-codex-${process.pid}-${Date.now()}`);
  const bin = join(root, "npm");
  const target = join(bin, "codex");
  const bash = join(bin, "bash.exe");
  mkdirSync(bin, { recursive: true });
  writeFileSync(target, "#!/bin/sh\n", "utf8");
  writeFileSync(bash, "", "utf8");

  const invocation = codexInvocation(["exec", "prompt & still an argv"], "win32", {
    PATH: bin,
    GIT_BASH_BIN: bash,
  });

  assert.equal(invocation.command, bash);
  assert.equal(invocation.detached, false);
  assert.equal(invocation.windowsHide, true);
  assert.equal(invocation.args[0], target);
  assert.deepEqual(invocation.args.slice(1), ["exec", "prompt & still an argv"]);
});

test("Windows shell commands use the configured Git Bash executable", () => {
  const root = join(tmpdir(), `figma-harness-git-bash-${process.pid}-${Date.now()}`);
  const bash = join(root, "bash.exe");
  mkdirSync(root, { recursive: true });
  writeFileSync(bash, "", "utf8");

  const invocation = shellInvocation("npm run figma:verify", "win32", {
    GIT_BASH_BIN: bash,
  });

  assert.equal(invocation.command, bash);
  assert.deepEqual(invocation.args, ["-lc", "npm run figma:verify"]);
});

test("Windows shell resolution fails clearly when Git Bash is unavailable", () => {
  assert.throws(
    () => shellInvocation("npm run figma:verify", "win32", { PATH: "" }),
    /Git Bash executable could not be resolved/,
  );
});

test("Codex MCP approval overrides are emitted as repeatable config flags", () => {
  assert.deepEqual(mcpApprovalConfigArgs("figma-mcp-go", ["get_metadata", "create_section"]), [
    "--config",
    'mcp_servers.figma-mcp-go.tools.get_metadata.approval_mode="approve"',
    "--config",
    'mcp_servers.figma-mcp-go.tools.create_section.approval_mode="approve"',
  ]);
});
