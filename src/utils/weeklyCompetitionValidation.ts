
/**
 * VALIDAÇÃO SEMANAL RADICAL SIMPLIFICADA
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

export interface WeeklyCompetitionData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  max_participants: number;
  competition_type: 'tournament';
}

/**
 * Validação RADICAL SIMPLIFICADA para competições semanais
 * SEM conversões de timezone - apenas validação de campos e horários simples
 */
export const validateWeeklyCompetitionData = (data: Partial<WeeklyCompetitionData>): WeeklyCompetitionData => {
  console.log('🔍 VALIDAÇÃO SEMANAL SIMPLIFICADA:', data);
  
  if (!data.title || !data.description || !data.start_date || !data.end_date) {
    throw new Error('Dados obrigatórios faltando para competição semanal');
  }

  // SIMPLES: criar datas com horários fixos, SEM conversões de timezone
  const startDate = createSimpleStartOfDay(new Date(data.start_date)); // 00:00:00
  const endDate = createSimpleEndOfDay(new Date(data.end_date)); // 23:59:59
  
  console.log('✅ HORÁRIOS DEFINIDOS (SIMPLES):', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startLocal: startDate.toLocaleDateString('pt-BR'),
    endLocal: endDate.toLocaleDateString('pt-BR')
  });

  const validatedData: WeeklyCompetitionData = {
    title: data.title,
    description: data.description,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    prize_pool: data.prize_pool || 0,
    max_participants: data.max_participants || 1000,
    competition_type: 'tournament'
  };

  console.log('🎯 DADOS VALIDADOS (TRIGGER DO BANCO AJUSTARÁ TIMEZONE):', validatedData);
  return validatedData;
};

/**
 * Formata horário para exibição - VERSÃO SIMPLIFICADA
 */
export const formatWeeklyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Para competições semanais, sempre mostrar horários fixos
  const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
  
  return `${dateFormatted}, ${timeFormatted} (Brasília)`;
};

/**
 * Verificação SIMPLIFICADA - sem conversões complexas
 */
export const isWeeklyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificação simples: se início é 00:00:00 e fim é 23:59:59
  const isStartValid = start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0;
  const isEndValid = end.getHours() === 23 && end.getMinutes() === 59 && end.getSeconds() === 59;
  
  console.log('🕐 VALIDAÇÃO SIMPLIFICADA:', {
    start: start.toISOString(),
    end: end.toISOString(),
    isStartValid,
    isEndValid,
    isValid: isStartValid && isEndValid
  });
  
  return isStartValid && isEndValid;
};

console.log('🎯 VALIDAÇÃO SEMANAL RADICAL SIMPLIFICADA ATIVADA');
