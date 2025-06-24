
import { secureLogger } from '@/utils/secureLogger';

export const validateWeeklyCompetitionData = (formData: any) => {
  secureLogger.debug('Validando dados de competição semanal', { formData }, 'WEEKLY_COMPETITION_VALIDATION');
  
  if (!formData.title?.trim()) {
    throw new Error('Título é obrigatório');
  }

  if (!formData.description?.trim()) {
    throw new Error('Descrição é obrigatória');
  }

  if (!formData.startDate) {
    throw new Error('Data de início é obrigatória');
  }

  if (!formData.endDate) {
    throw new Error('Data de fim é obrigatória');
  }

  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);

  if (startDate >= endDate) {
    throw new Error('Data de fim deve ser posterior à data de início');
  }

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    competition_type: 'tournament',
    max_participants: formData.maxParticipants || 1000
  };
};

export const isWeeklyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar se a data de fim é posterior à de início
    return end > start;
  } catch (error) {
    secureLogger.error('Erro na validação de horário semanal', { error }, 'WEEKLY_COMPETITION_VALIDATION');
    return false;
  }
};
