
import { useEffect } from 'react';
import { useCompetitionAutomation } from './useCompetitionAutomation';
import { useParticipationManagement } from './useParticipationManagement';
import { useDailyCompetitionFinalization } from './useDailyCompetitionFinalization';

export const useCompetitionIntegration = () => {
  // Executar automação de competições
  useCompetitionAutomation();
  
  // Gerenciar participações dos usuários
  const participationManager = useParticipationManagement();
  
  // Finalização automática de competições diárias
  useDailyCompetitionFinalization();

  useEffect(() => {
    console.log('🔗 Sistema de competições totalmente integrado');
    console.log('✅ Automação de ativação/finalização: Ativa');
    console.log('✅ Gerenciamento de participações: Ativo');
    console.log('✅ Finalização de competições diárias: Ativa');
    console.log('✅ Transferência automática de pontos: Ativa');
    console.log('✅ Rankings em tempo real: Disponível');
  }, []);

  return {
    participationManager
  };
};
