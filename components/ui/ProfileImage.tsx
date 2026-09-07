"use client";
import Image, { type ImageProps } from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FEMALE_DISCOVER_PHOTO_FALLBACK,
  FEMALE_PROFILE_PHOTO_FALLBACK,
  MALE_DISCOVER_PHOTO_FALLBACK,
  MALE_PROFILE_PHOTO_FALLBACK,
  PROFILE_PHOTO_FALLBACK,
} from "@/lib/profile-photo";

function mobileProfileViewFallback(src: string, pathname: string, mobile: boolean) {
  if (!mobile || !pathname.startsWith("/profile/")) return src;
  if (src === FEMALE_PROFILE_PHOTO_FALLBACK) return FEMALE_DISCOVER_PHOTO_FALLBACK;
  if (src === MALE_PROFILE_PHOTO_FALLBACK) return MALE_DISCOVER_PHOTO_FALLBACK;
  return src;
}

export function ProfileImage({
  src,
  alt,
  fallbackSrc = PROFILE_PHOTO_FALLBACK,
  onError,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const normalized = useMemo(() => {
    const source = typeof src === "string" && src.trim() ? src : fallbackSrc;
    return mobileProfileViewFallback(source, pathname, mobile);
  }, [fallbackSrc, mobile, pathname, src]);

  const resolvedFallback = useMemo(
    () => mobileProfileViewFallback(fallbackSrc, pathname, mobile),
    [fallbackSrc, mobile, pathname],
  );

  const [currentSrc, setCurrentSrc] = useState(normalized);
  useEffect(() => setCurrentSrc(normalized), [normalized]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== resolvedFallback) setCurrentSrc(resolvedFallback);
      }}
    />
  );
}
