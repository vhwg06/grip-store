export function uniqueProductModelName(prefix = "ProductModel"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
