"use client";

import { usePathname } from "next/navigation";

function normalizePrefix(prefix: string) {
  return prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
}

export function resolveRouteParamFromPath(
  fallbackParam: string,
  routePrefix: string,
  pathname: string | null
) {
  const trimmed = fallbackParam.trim();
  if (trimmed && trimmed !== "placeholder") {
    return trimmed;
  }

  if (!pathname) {
    return trimmed;
  }

  const base = normalizePrefix(routePrefix);
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const prefix = `${base}/`;

  if (!path.startsWith(prefix)) {
    return trimmed;
  }

  const dynamicValue = decodeURIComponent(path.slice(prefix.length).split("/")[0] ?? "").trim();
  if (!dynamicValue || dynamicValue === "placeholder") {
    return trimmed;
  }

  return dynamicValue;
}

export function useResolvedRouteParam(fallbackParam: string, routePrefix: string) {
  const pathname = usePathname();
  return resolveRouteParamFromPath(fallbackParam, routePrefix, pathname);
}
