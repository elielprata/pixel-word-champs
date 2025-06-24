
import { secureLogger } from '@/utils/secureLogger';

export const validateDailyCompetitionData = (formData: any) => {
  secureLogger.debug('Validando dados de competição diária', { formData }, 'DAILY_COMPETITION_VALIDATION');
  
  if (!formData.title?.trim()) {
    throw new Error('Título é obrigatório');
  }

  if (!formData.description?.trim()) {
    throw new Error('Descrição é obrigatória');
  }

  if (!formData.startDate) {
    throw new Error('Data de início é obrigatória');
  }

  // Para competições diárias, sempre usar horário completo do dia
  const startDate = new Date(formData.startDate);
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    theme: formData.theme || 'Geral',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    competition_type: 'challenge',
    prize_pool: 0 // Competições diárias não têm prêmios
  };
};

export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar se é o mesmo dia
    const isSameDay = start.toDateString() === end.toDateString();
    
    // Verificar se termina às 23:59:59
    const endsAtEndOfDay = 
      end.getHours() === 23 && 
      end.getMinutes() === 59 && 
      end.getSeconds() === 59;
    
    return isSameDay && endsAtEndOfDay;
  } catch (error) {
    secureLogger.error('Erro na validação de horário diário', { error }, 'DAILY_COMPETITION_VALIDATION');
    return false;
  }
};
