import {
  After,
  Before,
  setWorldConstructor,
  World,
  type IWorldOptions,
} from "@cucumber/cucumber";
import type { Pickle } from "@cucumber/messages";
import {
  chromium,
  request as playwrightRequest,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { testApiBaseUrl } from "../runtime/api-helpers/auth.helpers";
import {
  CartPage,
  CheckoutPage,
  ProductDetailPage,
} from "../runtime/objects";
import { GoBackendClient } from "../runtime/api-helpers/go-backend.client";
import { runCleanup, type CleanupTask } from "../data/test-isolation";

export type ScenarioBinding = {
  id: string;
  module: string;
  feature: string;
  steps: string;
  layer: string;
};

export type CheckoutBrowserDriver = {
  request: APIRequestContext;
  page: Page;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export class ScenarioWorld extends World {
  scenarioId?: string;
  scenarioBinding?: ScenarioBinding;
  activeModule?: string;
  readonly state: Record<string, unknown> = {};
  private apiRequest?: APIRequestContext;
  private browser?: Browser;
  private browserContext?: BrowserContext;
  private page?: Page;
  private cleanupTasks: CleanupTask[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }

  async getApiRequest(): Promise<APIRequestContext> {
    this.apiRequest ??= await playwrightRequest.newContext({ baseURL: testApiBaseUrl() });
    return this.apiRequest;
  }

  async getApiClient(): Promise<GoBackendClient> {
    return new GoBackendClient(await this.getApiRequest());
  }

  async getCheckoutBrowserDriver(): Promise<CheckoutBrowserDriver> {
    this.browser ??= await chromium.launch({ headless: true });
    const webBaseUrl = process.env.TEST_WEB_BASE_URL?.trim();
    if (!webBaseUrl) throw new Error("Set TEST_WEB_BASE_URL before running browser scenarios.");
    this.browserContext ??= await this.browser.newContext({ baseURL: webBaseUrl });
    this.page ??= await this.browserContext.newPage();
    const request = await this.getApiRequest();
    return {
      request,
      page: this.page,
      productDetailPage: new ProductDetailPage(this.page),
      cartPage: new CartPage(this.page),
      checkoutPage: new CheckoutPage(this.page),
    };
  }

  async getBrowserPage(): Promise<Page> {
    await this.getCheckoutBrowserDriver();
    return this.page as Page;
  }

  async closeExternalResources(): Promise<void> {
    await this.page?.close().catch(() => undefined);
    await this.browserContext?.close().catch(() => undefined);
    await this.browser?.close().catch(() => undefined);
    await this.apiRequest?.dispose().catch(() => undefined);
    this.page = undefined;
    this.browserContext = undefined;
    this.browser = undefined;
    this.apiRequest = undefined;
  }

  registerCleanup(task: CleanupTask): void {
    this.cleanupTasks.push(task);
  }

  async cleanupScenarioData(): Promise<void> {
    await runCleanup(this.cleanupTasks);
    this.cleanupTasks = [];
  }
}

setWorldConstructor(ScenarioWorld);

const testRoot = path.resolve(__dirname, "../..");
const modulesRoot = path.join(testRoot, "modules");
let bindings: Map<string, ScenarioBinding> | undefined;

function findManifests(directory: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...findManifests(entryPath));
    if (entry.isFile() && entry.name === "manifest.yaml") result.push(entryPath);
  }
  return result.sort();
}

function readFeatureScenarioMeta(featurePath: string): Map<string, { layer: string; status: string }> {
  const source = fs.readFileSync(featurePath, "utf8");
  const result = new Map<string, { layer: string; status: string }>();
  let pendingTags: string[] = [];
  let ruleTags: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (/^\s*@/.test(line)) {
      pendingTags.push(...[...line.matchAll(/@([A-Za-z0-9-]+)/g)].map((match) => match[1]));
      continue;
    }
    if (/^\s*Rule\s*:/.test(line)) {
      ruleTags = pendingTags;
      pendingTags = [];
      continue;
    }
    const scenario = /^\s*Scenario(?: Outline)?\s*:/.test(line);
    if (!scenario) {
      if (line.trim() && !/^\s*(Examples|\|)/.test(line)) pendingTags = [];
      continue;
    }
    const id = pendingTags.find((tag) => /^SC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(tag));
    const layer = pendingTags.find((tag) => ["acceptance", "api", "browser"].includes(tag));
    const status = pendingTags.find((tag) => ["accepted", "deferred"].includes(tag));
    if (id && layer && status) result.set(id, { layer, status });
    pendingTags = [];
  }
  return result;
}

function readBindings(): Map<string, ScenarioBinding> {
  const result = new Map<string, ScenarioBinding>();
  for (const manifestPath of findManifests(modulesRoot)) {
    const source = fs.readFileSync(manifestPath, "utf8");
    const module = source.match(/^module:\s*(.+)$/m)?.[1]?.trim();
    const feature = source.match(/^\s+feature:\s*(.+)$/m)?.[1]?.trim();
    const steps = source.match(/^\s+steps:\s*(.+)$/m)?.[1]?.trim();
    if (!module || !feature || !steps) continue;
    const featureMeta = readFeatureScenarioMeta(path.join(testRoot, feature));
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s{2}(SC-[A-Z0-9]+(?:-[A-Z0-9]+)+):/);
      if (!match) continue;
      const metadata = featureMeta.get(match[1]);
      const status = metadata?.status;
      const layer = metadata?.layer;
      if (!status || !layer || status === "deferred") continue;
      if (result.has(match[1])) throw new Error(`Duplicate Cucumber scenario binding: ${match[1]}`);
      result.set(match[1], { id: match[1], module, feature, steps, layer });
    }
  }
  return result;
}

function scenarioId(pickle: Pickle): string | undefined {
  return pickle.tags
    .map((tag) => tag.name.replace(/^@/, ""))
    .find((tag) => /^SC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(tag));
}

Before(function (this: ScenarioWorld, { pickle }) {
  bindings ??= readBindings();
  const id = scenarioId(pickle);
  if (!id) throw new Error(`Cucumber scenario has no stable ID: ${pickle.name}`);
  const binding = bindings.get(id);
  if (!binding) throw new Error(`No manifest scenario binding for @${id}`);
  const feature = path.relative(testRoot, path.resolve(testRoot, pickle.uri)).split(path.sep).join("/");
  if (feature !== binding.feature) {
    throw new Error(
      `Scenario @${id} is in ${feature}, but its manifest feature is ${binding.feature}`,
    );
  }
  if (!fs.existsSync(path.join(testRoot, binding.steps))) {
    throw new Error(`Scenario @${id} has no Cucumber steps file: ${binding.steps}`);
  }
  this.scenarioId = id;
  this.scenarioBinding = binding;
});

After(function (this: ScenarioWorld) {
  if (!this.scenarioBinding) return;
  if (this.activeModule !== this.scenarioBinding.module) {
    throw new Error(
      `Scenario @${this.scenarioBinding.id} did not reach ${this.scenarioBinding.steps}`,
    );
  }
});

After(async function (this: ScenarioWorld) {
  await this.cleanupScenarioData();
  await this.closeExternalResources();
});
