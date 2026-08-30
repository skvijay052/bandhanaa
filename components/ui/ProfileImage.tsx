"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { PROFILE_PHOTO_FALLBACK } from "@/lib/profile-photo";

export function ProfileImage({
  src,
  alt,
  fallbackSrc = PROFILE_PHOTO_FALLBACK,
  onError,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const normalized = typeof src === "string" && src.trim() ? src : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalized);
  useEffect(() => setCurrentSrc(normalized), [normalized]);
  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
