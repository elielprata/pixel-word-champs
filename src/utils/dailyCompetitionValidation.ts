
import { ensureEndOfDay } from '@/utils/brasiliaTime';

/**
 * Utilitários específicos para validação de competições diárias
 */

export interface DailyCompetitionData {
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date?: string; // Opcional pois será calculado automaticamente
  competition_type: 'challenge';
}

/**
 * Valida e corrige dados de competição diária
 * GARANTE que sempre termine às 23:59:59
 */
export const validateDailyCompetitionData = (data: Partial<DailyCompetitionData>): DailyCompetitionData => {
  console.log('🔍 Validando dados da competição diária:', data);
  
  if (!data.title || !data.description || !data.theme || !data.start_date) {
    throw new Error('Dados obrigatórios faltando para competição diária');
  }

  // FORÇAR: sempre calcular end_date baseado na start_date às 23:59:59
  const startDate = new Date(data.start_date);
  const endDate = ensureEndOfDay(startDate);
  
  console.log('✅ Horário de fim corrigido automaticamente:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    endTime: endDate.toTimeString()
  });

  const validatedData: DailyCompetitionData = {
    title: data.title,
    description: data.description,
    theme: data.theme,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(), // SEMPRE 23:59:59
    competition_type: 'challenge'
  };

  return validatedData;
};

/**
 * Formata horário para exibição na UI
 */
export const formatDailyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Para competições diárias, sempre mostrar horários fixos
  const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
  
  return `${dateFormatted}, ${timeFormatted}`;
};

/**
 * Verifica se uma competição diária está com horário correto
 */
export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificar se o fim é realmente 23:59:59 do mesmo dia
  const expectedEnd = ensureEndOfDay(start);
  
  const isValid = Math.abs(end.getTime() - expectedEnd.getTime()) < 1000; // 1 segundo de tolerância
  
  console.log('🕐 Validação de horário:', {
    start: start.toISOString(),
    end: end.toISOString(),
    expectedEnd: expectedEnd.toISOString(),
    isValid
  });
  
  return isValid;
};
