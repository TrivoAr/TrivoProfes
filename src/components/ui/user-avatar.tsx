"use client";

import { useState } from "react";
import Image from "next/image";
import { useProfileImage } from "@/hooks/use-profile-image";

interface UserAvatarProps {
  userId: string;
  firstName: string;
  lastName: string;
  className?: string;
  alt?: string;
  size?: number;
}

export function UserAvatar({
  userId,
  firstName,
  lastName,
  className = "h-10 w-10 rounded-full object-cover border shadow-sm",
  alt,
  size = 128,
}: UserAvatarProps) {
  const fullName = `${firstName} ${lastName}`;
  const { imageUrl } = useProfileImage(userId, fullName);
  const [error, setError] = useState(false);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&length=1&background=random&color=fff&size=${size}`;

  return (
    <Image
      src={error ? fallbackUrl : imageUrl}
      alt={alt || fullName}
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      quality={75}
    />
  );
}
