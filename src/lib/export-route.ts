function trimSlashes(value: string) {
  if (!value) return "";
  return value.replace(/^\/+|\/+$/g, "");
}

export function buildExportRoutePath(prefix: string, value: string, queryKey = "id") {
  const normalizedPrefix = `/${trimSlashes(prefix)}`;
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return normalizedPrefix;
  }

  const query = new URLSearchParams();
  query.set(queryKey, normalizedValue);

  return `${normalizedPrefix}/placeholder?${query.toString()}`;
}

