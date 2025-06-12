
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

      logger.info('Iniciando upload de avatar', { userId, fileSize: file.size, fileType: file.type }, 'AVATAR_SERVICE');

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

      logger.info('Avatar carregado com sucesso', { userId, fileName }, 'AVATAR_SERVICE');
      return createSuccessResponse(publicUrl);
    } catch (error: any) {
      logger.error('Erro no upload de avatar', { error: error.message, userId }, 'AVATAR_SERVICE');
      return createErrorResponse(handleServiceError(error, 'AVATAR_UPLOAD'));
    }
  }

  async deleteAvatar(userId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Removendo avatar do usuário', { userId }, 'AVATAR_SERVICE');
      
      const { error } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

      if (error) throw error;

      logger.info('Avatar removido com sucesso', { userId }, 'AVATAR_SERVICE');
      return createSuccessResponse(true);
    } catch (error: any) {
      logger.error('Erro ao remover avatar', { error: error.message, userId }, 'AVATAR_SERVICE');
      return createErrorResponse(handleServiceError(error, 'AVATAR_DELETE'));
    }
  }
}

export const avatarService = new AvatarService();
