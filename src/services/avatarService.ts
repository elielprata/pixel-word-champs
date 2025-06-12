
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

class AvatarService {
  async uploadAvatar(file: File, userId: string): Promise<ApiResponse<string>> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      logger.debug('Avatar uploaded successfully');
      return createSuccessResponse(publicUrl);
    } catch (error) {
      logger.error('Avatar upload failed', { error });
      return createErrorResponse(handleServiceError(error, 'AVATAR_UPLOAD'));
    }
  }

  async deleteAvatar(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

      if (error) throw error;

      logger.debug('Avatar deleted successfully');
      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Avatar deletion failed', { error });
      return createErrorResponse(handleServiceError(error, 'AVATAR_DELETE'));
    }
  }
}

export const avatarService = new AvatarService();
