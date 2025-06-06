
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class AvatarService {
  async uploadAvatar(file: File, userId: string): Promise<ApiResponse<string>> {
    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Máximo 5MB');
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Fazer upload
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Substitui arquivo existente
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return createSuccessResponse(publicUrl);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'AVATAR_UPLOAD'));
    }
  }

  async deleteAvatar(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

      if (error) throw error;

      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'AVATAR_DELETE'));
    }
  }
}

export const avatarService = new AvatarService();
