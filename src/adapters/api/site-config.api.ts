import { apiFetch } from "@/adapters/api/http-client";
import { SiteConfig } from "@/domain/site-config";

export async function getSiteConfig() {
  const payload = await apiFetch<any>("/api/site-config");
  const raw = payload?.data !== undefined ? payload.data : payload;

  if (raw?.brand || raw?.contact || raw?.footer || raw?.floatingSupport) {
    const footer = raw.footer || {};
    const contact = raw.contact || {};
    const floatingSupport = Array.isArray(raw.floatingSupport) ? raw.floatingSupport : [];

    return {
      floatingButtons: floatingSupport.map((action: any) => ({
        id: String(action?.key ?? ""),
        type: action?.key,
        url: action?.target ?? undefined,
        isActive: Boolean(action?.enabled),
      })),
      footerColumns: Array.isArray(footer.columns) ? footer.columns : [],
      contactAddress: contact.stickyBarAddress || "",
      contactEmail: contact.contactEmail || "",
      contactHotline: contact.stickyBarHotline || "",
      socialLinks: {
        ...(footer.socialLinks || {}),
        zalo: floatingSupport.find((action: any) => action?.key === "zalo" && action?.enabled)?.target || undefined,
      },
      aboutUsMarkdown: raw?.aboutUsMarkdown ?? undefined,
    } satisfies SiteConfig;
  }

  return raw as SiteConfig;
}
