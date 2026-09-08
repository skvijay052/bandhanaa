"use client";

import { useEffect } from "react";

const profilePhotoMap: Record<string, string> = {
  "Ananya profile": "/profiles/ananya.png",
  "Ananya, 26": "/profiles/ananya.png",
  "Rohit, 28": "/profiles/rohan.png",
  "Meera, 27": "/profiles/priya.png",
};

export function HomepageProfilePhotos() {
  useEffect(() => {
    const home = document.getElementById("discover");
    if (!home) return;

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("img"));

    images.forEach((image) => {
      const replacement = profilePhotoMap[image.alt];
      if (!replacement) return;

      image.src = replacement;
      image.removeAttribute("srcset");
      image.setAttribute("data-home-profile-photo", "original");
    });
  }, []);

  return null;
}
