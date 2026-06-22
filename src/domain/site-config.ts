export interface FloatingButton {
  id: string;
  type: "zalo" | "messenger" | "hotline" | "scroll_to_top";
  url?: string;
  icon?: string;
  label?: string;
  isActive: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface SiteConfig {
  floatingButtons: FloatingButton[];
  footerColumns: FooterColumn[];
  contactAddress?: string;
  contactEmail?: string;
  contactHotline?: string;
  bannerPages?: {
    homepage?: {
      enabled: boolean;
      present: boolean;
    };
    products?: {
      enabled: boolean;
      present: boolean;
    };
  };
  bannerPresence?: {
    enabled: boolean;
    present: boolean;
  };
  aboutPresence?: {
    enabled: boolean;
    present: boolean;
  };
  socialLinks?: {
    facebook?: string;
    zalo?: string;
    youtube?: string;
    instagram?: string;
  };
  aboutUsMarkdown?: string;
}

export interface AboutPageData {
  title: string;
  slug: string;
  body: string;
  gallery: string[];
  templateKey: string;
  status: string;
}
