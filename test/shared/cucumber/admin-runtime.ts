import type { ScenarioWorld } from "./world";
import { getAdminToken } from "../runtime/api-helpers/auth.helpers";

export type AdminResponseState = {
  status: number;
  data: unknown;
  path: string;
};

export type AdminScenarioState = {
  admin?: boolean;
  response?: AdminResponseState;
  recordId?: string;
};

export function adminState(world: ScenarioWorld): AdminScenarioState {
  return world.state as AdminScenarioState;
}

export async function authenticateAdmin(world: ScenarioWorld): Promise<void> {
  await getAdminToken(await world.getApiRequest());
  adminState(world).admin = true;
}

export async function adminGet(world: ScenarioWorld, path: string): Promise<void> {
  const token = await getAdminToken(await world.getApiRequest());
  const response = await (await world.getApiClient()).get(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  adminState(world).response = { status: response.status, data: response.data, path };
}

export async function adminPost(world: ScenarioWorld, path: string, data: unknown = {}): Promise<void> {
  const token = await getAdminToken(await world.getApiRequest());
  const response = await (await world.getApiClient()).post(path, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  adminState(world).response = { status: response.status, data: response.data, path };
}

export async function adminPut(world: ScenarioWorld, path: string, data: unknown = {}): Promise<void> {
  const token = await getAdminToken(await world.getApiRequest());
  const response = await (await world.getApiClient()).put(path, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  adminState(world).response = { status: response.status, data: response.data, path };
}

export async function adminPatch(world: ScenarioWorld, path: string, data: unknown = {}): Promise<void> {
  const token = await getAdminToken(await world.getApiRequest());
  const response = await (await world.getApiClient()).patch(path, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  adminState(world).response = { status: response.status, data: response.data, path };
}

export async function adminDelete(world: ScenarioWorld, path: string): Promise<void> {
  const token = await getAdminToken(await world.getApiRequest());
  const response = await (await world.getApiClient()).delete(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  adminState(world).response = { status: response.status, data: response.data, path };
}

export function responseData(world: ScenarioWorld): Record<string, unknown> {
  const data = adminState(world).response?.data;
  return data && typeof data === "object" ? data as Record<string, unknown> : {};
}

export function assertReadable(world: ScenarioWorld): void {
  const status = adminState(world).response?.status ?? 0;
  if (status >= 400) throw new Error(`Admin contract request failed with ${status}`);
}

export function assertAccepted(world: ScenarioWorld): void {
  const status = adminState(world).response?.status ?? 0;
  if (status < 200 || status >= 300) throw new Error(`Expected accepted admin response, received ${status}`);
}

export function assertRejected(world: ScenarioWorld): void {
  const status = adminState(world).response?.status ?? 0;
  if (status < 400 || status >= 500) throw new Error(`Expected rejected admin response, received ${status}`);
}
