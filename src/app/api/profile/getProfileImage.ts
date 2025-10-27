import { ImageService } from "@/services/ImageService";

/**
 * Obtener imagen de perfil de un usuario
 * @param fileName - Nombre del archivo (por defecto "profile-image.jpg")
 * @param userId - ID del usuario
 * @returns URL de la imagen desde Firebase Storage
 */
export const getProfileImage = async (
  fileName: string,
  userId: string
): Promise<string> => {
  return await ImageService.getImageUrl(`profile/${userId}`, fileName);
};
