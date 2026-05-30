"use client";

import { usePathname, useSearchParams } from "next/navigation";

type SearchParamsLike = { get: (key: string) => string | null };

function normalizePrefix(prefix: string) {
  return prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
}

export function resolveRouteParamFromPath(
  fallbackParam: string,
  routePrefix: string,
  pathname: string | null,
  searchParamCandidates: string[] = ["id", "slug", "orderId"],
  searchParams?: SearchParamsLike | null
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
    if (searchParams) {
      for (const key of searchParamCandidates) {
        const value = searchParams.get(key)?.trim();
        if (value && value !== "placeholder") {
          return value;
        }
      }
    }
    return trimmed;
  }

  return dynamicValue;
}

export function useResolvedRouteParam(
  fallbackParam: string,
  routePrefix: string,
  searchParamCandidates?: string[]
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return resolveRouteParamFromPath(
    fallbackParam,
    routePrefix,
    pathname,
    searchParamCandidates,
    searchParams
  );
}
