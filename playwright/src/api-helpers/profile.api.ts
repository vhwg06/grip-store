import { GoBackendClient, type ApiResponse } from "./go-backend.client";
import type { UserProfile } from "./auth.api";

export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

export interface PointsEntry {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
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

  async getPoints(): Promise<ApiResponse<{ points: number; history: PointsEntry[] }>> {
    return this.client.get("/v1/user/profile/points");
  }

  async checkin(): Promise<ApiResponse<{ points: number; streak: number }>> {
    return this.client.post("/v1/user/profile/checkin");
  }

  async getCheckinStatus(): Promise<ApiResponse<{ checked_in_today: boolean; streak: number }>> {
    return this.client.get("/v1/user/profile/checkin-status");
  }
}
