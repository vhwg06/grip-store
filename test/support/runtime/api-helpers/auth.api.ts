import { GoBackendClient, type ApiResponse } from "./go-backend.client";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: "user" | "admin";
}

function mapTokens(data: any) {
  if (!data) return data;
  return {
    token: data.token || data.accessToken || data.access_token,
    refresh_token: data.refresh_token || data.refreshToken,
    ...data,
  };
}

export class AuthApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
    const response = await this.client.post<any>("/v1/auth/refresh", { refresh_token: refreshToken });
    return {
      ...response,
      data: mapTokens(response.data),
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.client.post("/v1/auth/logout");
  }

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return this.client.get("/v1/auth/me");
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
    const response = await this.client.post<any>("/v1/auth/login", { email, password });
    return {
      ...response,
      data: mapTokens(response.data),
    };
  }

  async register(email: string, password: string, name?: string): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
    const response = await this.client.post<any>("/v1/auth/register", { email, password, name });
    return {
      ...response,
      data: mapTokens(response.data),
    };
  }
}
