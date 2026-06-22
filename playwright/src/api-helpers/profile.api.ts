import { GoBackendClient, type ApiResponse } from "./go-backend.client";
import type { UserProfile } from "./auth.api";

export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

export class ProfileApiHelper {
  constructor(private readonly client: GoBackendClient) {}

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.client.get("/v1/user/profile");
  }

  async updateEmail(email: string): Promise<ApiResponse<void>> {
    return this.client.put("/v1/user/profile", { email });
  }

  async updateNotifications(settings: NotificationSettings): Promise<ApiResponse<void>> {
    return this.client.put("/v1/user/profile/notifications", settings);
  }
}
