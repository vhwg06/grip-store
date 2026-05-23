import { apiFetch } from "@/adapters/api/http-client";
import { Brand } from "@/domain/brand";

export async function getBrands() {
  return apiFetch<Brand[]>("/api/catalog/brands");
}
