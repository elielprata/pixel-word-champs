
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const cleanOrphanGameSessions = async () => {
  try {
    logger.info('🧹 Iniciando limpeza de sessões órfãs...');

    // Buscar sessões não completadas (órfãs) - agora deve retornar 0 devido ao trigger
    const { data: orphanSessions, error: fetchError } = await supabase
      .from('game_sessions')
      .select('id, user_id, level, total_score, is_completed')
      .eq('is_completed', false);

    if (fetchError) {
      logger.error('Erro ao buscar sessões órfãs:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!orphanSessions || orphanSessions.length === 0) {
      logger.info('✅ TRIGGER FUNCIONANDO: Nenhuma sessão órfã encontrada - sistema protegido');
      return { success: true, deletedCount: 0, triggerWorking: true };
    }

    // Se chegou aqui, o trigger foi contornado de alguma forma - situação crítica
    logger.error(`🚨 CRÍTICO: ${orphanSessions.length} sessões órfãs encontradas mesmo com trigger ativo!`, {
      orphanSessions: orphanSessions.map(s => ({ id: s.id, user_id: s.user_id, level: s.level }))
    });

    // Deletar as sessões órfãs encontradas
    const { error: deleteError } = await supabase
      .from('game_sessions')
      .delete()
      .eq('is_completed', false);

    if (deleteError) {
      logger.error('Erro ao deletar sessões órfãs:', deleteError);
      return { success: false, error: deleteError.message };
    }

    logger.info(`🔧 ${orphanSessions.length} sessões órfãs removidas - investigar como foram criadas`);

    return { 
      success: true, 
      deletedCount: orphanSessions.length,
      triggerBypassed: true,
      warning: 'Sessões órfãs encontradas mesmo com trigger - investigar origem'
    };

  } catch (error) {
    logger.error('Erro na limpeza de sessões órfãs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

// Nova função para verificar integridade do sistema de prevenção
export const validateOrphanPrevention = async () => {
  try {
    logger.info('🔍 Validando sistema de prevenção de sessões órfãs...');
    
    // Verificar se existem sessões órfãs
    const { data: orphanSessions, error } = await supabase
      .from('game_sessions')
      .select('id, user_id, created_at')
      .eq('is_completed', false);

    if (error) {
      logger.error('Erro ao validar prevenção:', error);
      return { isProtected: false, error: error.message };
    }

    const orphanCount = orphanSessions?.length || 0;
    
    if (orphanCount === 0) {
      logger.info('✅ Sistema de prevenção funcionando corretamente - nenhuma sessão órfã');
      return { isProtected: true, orphanCount: 0 };
    } else {
      logger.error(`⚠️ ${orphanCount} sessões órfãs detectadas - sistema comprometido`, {
        orphanSessions: orphanSessions.slice(0, 5) // Apenas as primeiras 5 para não sobrecarregar logs
      });
      return { isProtected: false, orphanCount, needsInvestigation: true };
    }
  } catch (error) {
    logger.error('Erro na validação de prevenção:', error);
    return { isProtected: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};
