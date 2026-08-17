import { existsSync, readFileSync } from "node:fs";
import { delimiter, dirname, extname, isAbsolute, join, resolve } from "node:path";

export interface ProcessEnvironment {
  [key: string]: string | undefined;
}

export interface CodexInvocation {
  command: string;
  args: string[];
  detached: boolean;
  windowsHide: boolean;
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

function resolveNpmCmdNodeTarget(shimPath: string): string | null {
  let source: string;
  try {
    source = readFileSync(shimPath, "utf8");
  } catch {
    return null;
  }

  // npm's Windows command shim embeds the JS entry point relative to %dp0%.
  // Resolve that target and execute it with Node directly so arbitrary harness
  // prompts never pass through cmd.exe parsing.
  const match = source.match(/%dp0%[\\/]([^"\r\n]+?\.js)/i);
  if (!match) return null;

  const relativeTarget = match[1].replace(/[\\/]+/g, process.platform === "win32" ? "\\" : "/");
  const target = resolve(dirname(shimPath), relativeTarget);
  return existsSync(target) ? target : null;
}

function resolveWindowsCodex(configured: string | undefined, env: ProcessEnvironment): CodexInvocation {
  const requested = configured ?? "codex.cmd";
  const extension = extname(requested).toLowerCase();

  if (extension === ".exe") {
    return { command: requested, args: [], detached: false, windowsHide: true };
  }

  if (extension !== ".cmd" && extension !== ".bat") {
    const direct = findExecutableOnPath(requested, env);
    if (direct && extname(direct).toLowerCase() === ".exe") {
      return { command: direct, args: [], detached: false, windowsHide: true };
    }
  }

  const shim = findExecutableOnPath(requested, env);
  if (!shim) {
    throw new Error(
      `could not resolve Windows Codex launcher ${requested}; set CODEX_BIN to codex.cmd, a native codex.exe, or another executable path`,
    );
  }

  if (extname(shim).toLowerCase() === ".exe") {
    return { command: shim, args: [], detached: false, windowsHide: true };
  }

  const nodeTarget = resolveNpmCmdNodeTarget(shim);
  if (!nodeTarget) {
    throw new Error(
      `resolved ${shim}, but could not locate its npm JavaScript entry point; set CODEX_BIN to a native executable instead of launching arbitrary prompts through cmd.exe`,
    );
  }

  return {
    command: process.execPath,
    args: [nodeTarget],
    detached: false,
    windowsHide: true,
  };
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
