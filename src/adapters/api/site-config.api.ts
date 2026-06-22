import { apiFetch } from "@/adapters/api/http-client";
import { SiteConfig, AboutPageData } from "@/domain/site-config";

export async function getAboutPage(): Promise<AboutPageData> {
  const payload = await apiFetch<any>("/api/public/content/pages/about");
  const raw = payload?.data !== undefined ? payload.data : payload;
  return {
    title: String(raw?.title ?? "Về GRIP"),
    slug: String(raw?.slug ?? "about"),
    body: String(raw?.body ?? ""),
    gallery: Array.isArray(raw?.gallery) ? raw.gallery.filter((item: unknown) => typeof item === "string") : [],
    templateKey: String(raw?.templateKey ?? raw?.template_key ?? "about-us"),
    status: String(raw?.status ?? "published"),
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const payload = await apiFetch<any>("/api/site-config");
  const raw = payload?.data !== undefined ? payload.data : payload;

  const homepageBannerPresence = raw.bannerPages?.homepage
    ? {
        enabled: Boolean(raw.bannerPages.homepage.enabled),
        present: Boolean(raw.bannerPages.homepage.present),
      }
    : raw.bannerPresence
      ? {
          enabled: Boolean(raw.bannerPresence.enabled),
          present: Boolean(raw.bannerPresence.present),
        }
      : undefined;

  const productsBannerPresence = raw.bannerPages?.products
    ? {
        enabled: Boolean(raw.bannerPages.products.enabled),
        present: Boolean(raw.bannerPages.products.present),
      }
    : raw.bannerPresence
      ? {
          enabled: Boolean(raw.bannerPresence.enabled),
          present: Boolean(raw.bannerPresence.present),
        }
      : undefined;

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
      bannerPages: {
        homepage: homepageBannerPresence,
        products: productsBannerPresence,
      },
      bannerPresence: homepageBannerPresence,
      aboutPresence: raw.aboutPresence
        ? {
            enabled: Boolean(raw.aboutPresence.enabled),
            present: Boolean(raw.aboutPresence.present),
          }
        : undefined,
      socialLinks: {
        ...(footer.socialLinks || {}),
        zalo: floatingSupport.find((action: any) => action?.key === "zalo" && action?.enabled)?.target || undefined,
      },
      aboutUsMarkdown: raw?.aboutUsMarkdown ?? undefined,
    } satisfies SiteConfig;
  }

  return raw as SiteConfig;
}
