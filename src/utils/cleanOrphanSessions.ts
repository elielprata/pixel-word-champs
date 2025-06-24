
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const cleanOrphanGameSessions = async () => {
  try {
    logger.info('🧹 Iniciando limpeza de sessões órfãs...');

    // Buscar sessões não completadas (órfãs)
    const { data: orphanSessions, error: fetchError } = await supabase
      .from('game_sessions')
      .select('id, user_id, level, total_score, is_completed')
      .eq('is_completed', false);

    if (fetchError) {
      logger.error('Erro ao buscar sessões órfãs:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!orphanSessions || orphanSessions.length === 0) {
      logger.info('✅ Nenhuma sessão órfã encontrada');
      return { success: true, deletedCount: 0 };
    }

    logger.info(`🗑️ Encontradas ${orphanSessions.length} sessões órfãs para deletar`);

    // Deletar todas as sessões não completadas
    const { error: deleteError } = await supabase
      .from('game_sessions')
      .delete()
      .eq('is_completed', false);

    if (deleteError) {
      logger.error('Erro ao deletar sessões órfãs:', deleteError);
      return { success: false, error: deleteError.message };
    }

    logger.info(`✅ ${orphanSessions.length} sessões órfãs deletadas com sucesso`);

    // Verificar integridade após limpeza
    const { data: remainingSessions } = await supabase
      .from('game_sessions')
      .select('id, is_completed')
      .eq('is_completed', false);

    const remainingCount = remainingSessions?.length || 0;
    
    if (remainingCount === 0) {
      logger.info('✅ Limpeza concluída - nenhuma sessão órfã restante');
    } else {
      logger.warn(`⚠️ Ainda existem ${remainingCount} sessões órfãs após limpeza`);
    }

    return { 
      success: true, 
      deletedCount: orphanSessions.length,
      remainingOrphans: remainingCount 
    };

  } catch (error) {
    logger.error('Erro na limpeza de sessões órfãs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};
