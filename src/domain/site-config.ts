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
  socialLinks?: {
    facebook?: string;
    zalo?: string;
    youtube?: string;
    instagram?: string;
  };
  aboutUsMarkdown?: string;
}
