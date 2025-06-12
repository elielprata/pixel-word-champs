
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const validateAdminPassword = async (password: string) => {
  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user) {
    throw new Error('Usuário não autenticado');
  }

  logger.debug('Validando senha do administrador', { userId: currentUser.user.id }, 'ADMIN_PASSWORD_VALIDATION');

  // Criar sessão temporária para validar senha sem afetar a sessão atual
  const { data, error } = await supabase.auth.signInWithPassword({
    email: currentUser.user.email!,
    password: password
  });

  if (error) {
    logger.error('Senha de administrador incorreta', { error: error.message }, 'ADMIN_PASSWORD_VALIDATION');
    throw new Error('Senha de administrador incorreta');
  }

  logger.debug('Senha validada com sucesso', undefined, 'ADMIN_PASSWORD_VALIDATION');
  return true;
};
