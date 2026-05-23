"use client";

import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteConfig } from "@/application/hooks/useSiteConfig";

export function FloatingButtons() {
  const { config } = useSiteConfig();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {config?.socialLinks?.zalo && (
        <a 
          href={config.socialLinks.zalo} 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
      
      {config?.contactHotline && (
        <a 
          href={`tel:${config.contactHotline}`}
          className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`w-12 h-12 bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all ${
          showScroll ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}
