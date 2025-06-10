
import { supabase } from '@/integrations/supabase/client';

export const deleteTestCompetitions = async () => {
  try {
    console.log('🗑️ Iniciando exclusão das competições de teste...');
    
    // Deletar competições com títulos específicos de teste
    const { data: deletedCompetitions, error } = await supabase
      .from('custom_competitions')
      .delete()
      .in('title', [
        'TESTE 2 - COMPETIÇÃO',
        'TESTE DE COMPETIÇÃO'
      ])
      .select();

    if (error) {
      console.error('❌ Erro ao deletar competições:', error);
      throw error;
    }

    console.log('✅ Competições deletadas com sucesso:', deletedCompetitions);
    return {
      success: true,
      deletedCount: deletedCompetitions?.length || 0,
      deletedCompetitions
    };
  } catch (error) {
    console.error('❌ Erro na exclusão:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};
