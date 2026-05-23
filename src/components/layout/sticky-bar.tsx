"use client";

import { useSiteConfig } from "@/application/hooks/useSiteConfig";
import { MapPin, Phone } from "lucide-react";

export function StickyBar() {
  const { config } = useSiteConfig();

  return (
    <div className="bg-primary text-primary-foreground py-1.5 px-4 text-xs font-semibold h-8 flex items-center justify-between z-50 relative">
      <div className="container mx-auto flex justify-between items-center max-w-[1190px]">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{config?.contactAddress || "Hà Nội, Việt Nam"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          <span>Hotline: {config?.contactHotline || "1900 xxxx"}</span>
        </div>
      </div>
    </div>
  );
}
