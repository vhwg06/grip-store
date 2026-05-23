"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images?.length) return <div className="aspect-square bg-neutral-100 rounded-2xl w-full" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border">
        <Image 
          src={images[selectedImage]} 
          alt="Product image" 
          fill 
          className="object-cover"
          priority
        />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
        {images.map((img, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedImage(i)}
            className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
