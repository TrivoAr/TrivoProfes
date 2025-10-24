"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  salidaId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function ShareButton({
  salidaId,
  variant = "outline",
  size = "sm",
  showIcon = true,
  showText = true,
  className,
}: ShareButtonProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const shareLink = `https://trivo.com.ar/social/${salidaId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copiado",
        description: "El link de la salida ha sido copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopyLink}
      className={className}
    >
      {showIcon && <Share2 className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />}
      {showText && "Compartir"}
    </Button>
  );
}
