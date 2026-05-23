interface ContactMapProps {
  mapUrl?: string;
}

export function ContactMap({ mapUrl }: ContactMapProps) {
  // Default to a placeholder map if not provided
  const defaultUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.82653431533203!3d21.028811885998316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab748dc7ec15%3A0xf657d41f021759ea!2zVMO0aSBLaOG6o2ksIMSQ4buRbmcgxJBhLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1628134700000!5m2!1sen!2s";
  
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
      <iframe 
        src={mapUrl || defaultUrl} 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
