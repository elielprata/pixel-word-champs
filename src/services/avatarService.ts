
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class AvatarService {
  async uploadAvatar(file: File): Promise<string | null> {
    try {
      logger.info('Iniciando upload de avatar', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type 
      }, 'AVATAR_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de upload de avatar sem usuário autenticado', undefined, 'AVATAR_SERVICE');
        return null;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      logger.debug('Enviando arquivo para storage', { 
        filePath,
        userId: user.id 
      }, 'AVATAR_SERVICE');

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        logger.error('Erro ao fazer upload do avatar para storage', { 
          filePath,
          error: uploadError 
        }, 'AVATAR_SERVICE');
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      logger.info('Avatar enviado com sucesso', { 
        filePath,
        publicUrl,
        userId: user.id 
      }, 'AVATAR_SERVICE');

      return publicUrl;
    } catch (error) {
      logger.error('Erro crítico ao fazer upload de avatar', { error }, 'AVATAR_SERVICE');
      return null;
    }
  }

  async deleteAvatar(filePath: string): Promise<boolean> {
    try {
      logger.info('Removendo avatar', { filePath }, 'AVATAR_SERVICE');

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        logger.error('Erro ao remover avatar do storage', { 
          filePath, 
          error 
        }, 'AVATAR_SERVICE');
        throw error;
      }

      logger.info('Avatar removido com sucesso', { filePath }, 'AVATAR_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro crítico ao remover avatar', { 
        filePath, 
        error 
      }, 'AVATAR_SERVICE');
      return false;
    }
  }

  async updateProfileAvatar(avatarUrl: string): Promise<boolean> {
    try {
      logger.info('Atualizando URL do avatar no perfil', { avatarUrl }, 'AVATAR_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de atualizar avatar no perfil sem usuário autenticado', undefined, 'AVATAR_SERVICE');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Erro ao atualizar avatar no perfil', { 
          userId: user.id,
          avatarUrl, 
          error 
        }, 'AVATAR_SERVICE');
        throw error;
      }

      logger.info('Avatar atualizado no perfil com sucesso', { 
        userId: user.id,
        avatarUrl 
      }, 'AVATAR_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar avatar no perfil', { 
        avatarUrl, 
        error 
      }, 'AVATAR_SERVICE');
      return false;
    }
  }
}

export const avatarService = new AvatarService();
