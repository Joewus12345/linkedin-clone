"use client"

import Image from "next/image";
import { useState, useEffect } from "react";

interface SecureImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function SecureImage({ src, alt = "Post Image", width = 500, height = 500, className = "", }: SecureImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        const res = await fetch(`/api/getSasUrl?fileName=${src}`);
        if (!res.ok) throw new Error("Failed to fetch SAS URL");
        const data = await res.json();
        setImageUrl(data.url);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
    }

    fetchImageUrl();
  }, [src]);

  if (!imageUrl) return <p className="px-4 pb-2 mt-2">Loading...</p>;

  return <Image src={imageUrl} alt={alt} width={width} height={height} className={className} />;
}
