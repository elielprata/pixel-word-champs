
/**
 * VALIDAÇÃO DIÁRIA RADICAL SIMPLIFICADA
 * 
 * PRINCÍPIO: Remover TODAS as conversões de timezone do JavaScript.
 * O trigger do banco de dados é responsável por ajustar horários para Brasília.
 * 
 * MUDANÇA RADICAL:
 * - Apenas validação de campos obrigatórios
 * - Horários simples (00:00:00 e 23:59:59) sem conversões
 * - Banco ajusta timezone automaticamente via trigger
 */

import { createSimpleStartOfDay, createSimpleEndOfDay } from '@/utils/brasiliaTime';

export interface DailyCompetitionData {
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  competition_type: 'challenge';
}

/**
 * Validação RADICAL SIMPLIFICADA para competições diárias
 * SEM conversões de timezone - apenas validação de campos e horários simples
 */
export const validateDailyCompetitionData = (data: Partial<DailyCompetitionData>): DailyCompetitionData => {
  console.log('🔍 VALIDAÇÃO DIÁRIA SIMPLIFICADA:', data);
  
  if (!data.title || !data.start_date) {
    throw new Error('Dados obrigatórios faltando para competição diária');
  }

  // SIMPLES: criar datas com horários fixos, SEM conversões de timezone
  const startDate = createSimpleStartOfDay(new Date(data.start_date)); // 00:00:00
  const endDate = createSimpleEndOfDay(new Date(data.start_date)); // 23:59:59 do mesmo dia
  
  console.log('✅ HORÁRIOS DEFINIDOS (SIMPLES):', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startLocal: startDate.toLocaleDateString('pt-BR'),
    endLocal: endDate.toLocaleDateString('pt-BR')
  });

  const validatedData: DailyCompetitionData = {
    title: data.title,
    description: data.description || '',
    theme: data.theme || '',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    max_participants: data.max_participants || 1000,
    competition_type: 'challenge'
  };

  console.log('🎯 DADOS VALIDADOS (TRIGGER DO BANCO AJUSTARÁ TIMEZONE):', validatedData);
  return validatedData;
};

/**
 * Formata horário para exibição - VERSÃO SIMPLIFICADA
 */
export const formatDailyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Para competições diárias, sempre mostrar horários fixos
  const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
  
  return `${dateFormatted}, ${timeFormatted} (Brasília)`;
};

/**
 * Verificação SIMPLIFICADA - sem conversões complexas
 */
export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificação simples: se início é 00:00:00 e fim é 23:59:59 do mesmo dia
  const isStartValid = start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0;
  const isEndValid = end.getHours() === 23 && end.getMinutes() === 59 && end.getSeconds() === 59;
  const isSameDay = start.toDateString() === end.toDateString();
  
  console.log('🕐 VALIDAÇÃO SIMPLIFICADA:', {
    start: start.toISOString(),
    end: end.toISOString(),
    isStartValid,
    isEndValid,
    isSameDay,
    isValid: isStartValid && isEndValid && isSameDay
  });
  
  return isStartValid && isEndValid && isSameDay;
};

console.log('🎯 VALIDAÇÃO DIÁRIA RADICAL SIMPLIFICADA ATIVADA');
