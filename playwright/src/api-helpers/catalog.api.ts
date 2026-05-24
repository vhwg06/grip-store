import { GoBackendClient, type ApiResponse } from "./go-backend.client";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  active: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface BuyMeta {
  product_id: string;
  available: boolean;
  stock: number;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  currency: string;
}

export interface Announcement {
  id: string;
  content: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  search?: string;
}

export class CatalogApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  async getProducts(params?: ProductQueryParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return this.client.get(`/v1/catalog/products${query}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.client.get(`/v1/catalog/products/${id}`);
  }

  async getBuyMeta(id: string): Promise<ApiResponse<BuyMeta>> {
    return this.client.get(`/v1/catalog/products/${id}/buy-meta`);
  }

  async search(query: string): Promise<ApiResponse<Product[]>> {
    return this.client.get(`/v1/catalog/search?q=${encodeURIComponent(query)}`);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.client.get("/v1/catalog/categories");
  }

  async getSettings(): Promise<ApiResponse<SiteSettings>> {
    return this.client.get("/v1/catalog/settings");
  }

  async getAnnouncement(): Promise<ApiResponse<Announcement | null>> {
    return this.client.get("/v1/catalog/announcement");
  }
}
