"use client";

import { useState, useEffect } from "react";
import { ImageService } from "@/services/ImageService";

// Helper para generar URL de avatar compatible con Next.js Image
function generateSafeAvatarUrl(fullName: string): string {
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Usar un color fijo en lugar de 'random' para evitar error 400
  const bgColor = generateColorFromName(fullName);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&length=1&background=${bgColor}&color=fff&size=128`;
}

// Generar color consistente basado en el nombre
function generateColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "00000".substring(0, 6 - color.length) + color;
}

export function useProfileImage(userId: string, fullName: string) {
  const [imageUrl, setImageUrl] = useState<string>(() =>
    generateSafeAvatarUrl(fullName)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        // Use getProfileImageWithFallback which handles errors automatically
        const url = await ImageService.getProfileImageWithFallback(
          userId,
          fullName,
          "profile-image.jpg",
          5000 // 5 second timeout
        );

        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        // This should rarely happen since getProfileImageWithFallback handles errors
        if (isMounted) {
          setImageUrl(generateSafeAvatarUrl(fullName));
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [userId, fullName]);

  return { imageUrl, isLoading };
}
