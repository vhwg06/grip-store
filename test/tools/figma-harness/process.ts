import { existsSync } from "node:fs";
import { delimiter, extname, isAbsolute, join, resolve } from "node:path";

export interface ProcessEnvironment {
  [key: string]: string | undefined;
}

export interface CodexInvocation {
  command: string;
  args: string[];
  detached: boolean;
  windowsHide: boolean;
}

export interface ShellInvocation {
  command: string;
  args: string[];
}

export type TerminationPlan =
  | { kind: "windows-tree"; command: "taskkill"; args: string[] }
  | { kind: "posix-process-group"; pid: number; signal: NodeJS.Signals };

function pathCandidates(name: string, env: ProcessEnvironment): string[] {
  if (isAbsolute(name)) return [name];
  if (name.includes("/") || name.includes("\\")) return [resolve(name)];

  const directories = (env.PATH ?? env.Path ?? env.path ?? "").split(delimiter).filter(Boolean);
  return directories.map((directory) => join(directory, name));
}

export function findExecutableOnPath(name: string, env: ProcessEnvironment = process.env): string | null {
  for (const candidate of pathCandidates(name, env)) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveGitBash(env: ProcessEnvironment): string | null {
  const configured = env.GIT_BASH_BIN;
  if (configured) {
    const resolved = isAbsolute(configured) ? configured : findExecutableOnPath(configured, env);
    return resolved && existsSync(resolved) ? resolved : null;
  }

  const knownPaths = [
    env.ProgramFiles ? join(env.ProgramFiles, "Git", "usr", "bin", "bash.exe") : null,
    env["ProgramFiles(x86)"]
      ? join(env["ProgramFiles(x86)"], "Git", "usr", "bin", "bash.exe")
      : null,
    env.LOCALAPPDATA ? join(env.LOCALAPPDATA, "Programs", "Git", "usr", "bin", "bash.exe") : null,
  ];

  return knownPaths.find((candidate): candidate is string => Boolean(candidate && existsSync(candidate))) ?? null;
}

function resolveWindowsCodex(configured: string | undefined, env: ProcessEnvironment): CodexInvocation {
  const requested = configured ?? "codex";
  const extension = extname(requested).toLowerCase();

  if (extension === ".exe") {
    return { command: requested, args: [], detached: false, windowsHide: true };
  }

  const requestedScript = extension === ".cmd" || extension === ".bat" || extension === ".ps1"
    ? requested.slice(0, -extension.length)
    : requested;
  const script = findExecutableOnPath(requestedScript, env);
  if (!script) {
    throw new Error(
      `could not resolve the Windows Codex shell script ${requestedScript}; set CODEX_BIN to the Git Bash codex launcher`,
    );
  }

  const bash = resolveGitBash(env);
  if (!bash) {
    throw new Error(
      "Git Bash executable could not be resolved; set GIT_BASH_BIN to bash.exe or add Git Bash to PATH",
    );
  }

  return {
    command: bash,
    args: [script],
    detached: false,
    windowsHide: true,
  };
}

export function shellInvocation(
  command: string,
  platform: NodeJS.Platform = process.platform,
  env: ProcessEnvironment = process.env,
): ShellInvocation {
  if (platform !== "win32") {
    return { command: "/bin/sh", args: ["-lc", command] };
  }

  const bash = resolveGitBash(env);
  if (!bash) {
    throw new Error(
      "Git Bash executable could not be resolved; set GIT_BASH_BIN to bash.exe or add Git Bash to PATH",
    );
  }

  return { command: bash, args: ["-lc", command] };
}

export function mcpApprovalConfigArgs(server: string, tools: readonly string[]): string[] {
  return tools.flatMap((tool) => [
    "--config",
    `mcp_servers.${server}.tools.${tool}.approval_mode="approve"`,
  ]);
}

export function codexInvocation(
  args: string[],
  platform: NodeJS.Platform = process.platform,
  env: ProcessEnvironment = process.env,
): CodexInvocation {
  const configured = env.CODEX_BIN;

  if (platform === "win32") {
    const launcher = resolveWindowsCodex(configured, env);
    return { ...launcher, args: [...launcher.args, ...args] };
  }

  return {
    command: configured ?? "codex",
    args,
    // On POSIX, detached=true makes the child the leader of a new process
    // group/session. This lets forced harness cancellation signal the whole
    // Codex/MCP process group instead of only the immediate child.
    detached: true,
    windowsHide: false,
  };
}

export function terminationPlan(
  pid: number,
  force: boolean,
  platform: NodeJS.Platform = process.platform,
): TerminationPlan {
  if (platform === "win32") {
    return {
      kind: "windows-tree",
      command: "taskkill",
      args: ["/PID", String(pid), "/T", ...(force ? ["/F"] : [])],
    };
  }

  return {
    kind: "posix-process-group",
    pid: -pid,
    signal: force ? "SIGKILL" : "SIGTERM",
  };
}
