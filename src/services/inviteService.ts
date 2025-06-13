
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string;
  used_at?: string;
  is_active: boolean;
  created_at: string;
}

class InviteService {
  async generateInviteCode(): Promise<string | null> {
    try {
      logger.info('Gerando novo código de convite', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de gerar convite sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return null;
      }

      // Gerar código único
      const code = this.generateUniqueCode();

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar código de convite no banco de dados', { error }, 'INVITE_SERVICE');
        throw error;
      }

      logger.info('Código de convite gerado com sucesso', { 
        inviteId: invite.id,
        code: invite.code 
      }, 'INVITE_SERVICE');

      return invite.code;
    } catch (error) {
      logger.error('Erro crítico ao gerar código de convite', { error }, 'INVITE_SERVICE');
      return null;
    }
  }

  async validateInviteCode(code: string): Promise<boolean> {
    try {
      logger.debug('Validando código de convite', { code }, 'INVITE_SERVICE');

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Código de convite não encontrado ou inválido', { code }, 'INVITE_SERVICE');
          return false;
        }
        logger.error('Erro ao validar código de convite no banco de dados', { 
          code, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.debug('Código de convite válido', { 
        code, 
        inviteId: invite.id 
      }, 'INVITE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao validar código de convite', { 
        code, 
        error 
      }, 'INVITE_SERVICE');
      return false;
    }
  }

  async useInviteCode(code: string): Promise<boolean> {
    try {
      logger.info('Usando código de convite', { code }, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de usar convite sem usuário autenticado', { code }, 'INVITE_SERVICE');
        return false;
      }

      const { error } = await supabase
        .from('invite_codes')
        .update({
          used_by: user.id,
          used_at: new Date().toISOString(),
          is_active: false
        })
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null);

      if (error) {
        logger.error('Erro ao marcar código como usado no banco de dados', { 
          code, 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.info('Código de convite usado com sucesso', { 
        code, 
        userId: user.id 
      }, 'INVITE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao usar código de convite', { 
        code, 
        error 
      }, 'INVITE_SERVICE');
      return false;
    }
  }

  async getUserInvites(): Promise<InviteCode[]> {
    try {
      logger.debug('Buscando convites do usuário', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar convites sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return [];
      }

      const { data: invites, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar convites no banco de dados', { 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.debug('Convites carregados com sucesso', { 
        userId: user.id, 
        count: invites?.length || 0 
      }, 'INVITE_SERVICE');

      return invites || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar convites', { error }, 'INVITE_SERVICE');
      return [];
    }
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const inviteService = new InviteService();
