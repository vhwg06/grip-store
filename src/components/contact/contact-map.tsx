interface ContactMapProps {
  mapUrl?: string;
}

export function ContactMap({ mapUrl }: ContactMapProps) {
  // Default to a placeholder map if not provided
  const defaultUrl = "https://maps.google.com/maps?q=S%E1%BB%91%2005TH%20AVE%2C%20SunriseE%2C%20KDT%20The%20Manor%20Nguy%E1%BB%85n%20Xi%E1%BB%83n%2C%20P.%C4%90%E1%BA%A1i%20Kim%2C%20Ho%C3%A0ng%20Mai%2C%20H%C3%A0%20N%E1%BB%99i&t=&z=15&ie=UTF8&iwloc=&output=embed";
  
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
