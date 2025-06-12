
/**
 * VALIDAÇÃO SEMANAL RADICAL SIMPLIFICADA - VERSÃO FINAL
 * 
 * PRINCÍPIO: Remover TODAS as conversões de timezone do JavaScript.
 * O trigger do banco de dados é responsável por ajustar horários para Brasília.
 * 
 * MUDANÇA RADICAL FINAL:
 * - Apenas validação de campos obrigatórios
 * - ZERO conversões de Date objects
 * - Trabalhar apenas com strings simples
 * - Banco ajusta timezone automaticamente via trigger
 */

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
 * Validação RADICAL FINAL para competições semanais
 * SEM conversões de timezone - apenas validação de campos
 */
export const validateWeeklyCompetitionData = (data: Partial<WeeklyCompetitionData>): WeeklyCompetitionData => {
  console.log('🔍 VALIDAÇÃO SEMANAL RADICAL FINAL (ZERO conversões Date):', data);
  
  if (!data.title || !data.description || !data.start_date || !data.end_date) {
    throw new Error('Dados obrigatórios faltando para competição semanal');
  }

  // RADICAL FINAL: Usar strings como estão - SEM conversões Date
  const validatedData: WeeklyCompetitionData = {
    title: data.title,
    description: data.description,
    start_date: data.start_date, // STRING PURA - trigger do banco fará padronização
    end_date: data.end_date,     // STRING PURA - trigger do banco fará 23:59:59
    prize_pool: data.prize_pool || 0,
    max_participants: data.max_participants || 1000,
    competition_type: 'tournament'
  };

  console.log('🎯 DADOS VALIDADOS FINAL (TRIGGER DO BANCO AJUSTARÁ TIMEZONE):', validatedData);
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
  if (!startDate || !endDate) return false;
  
  // Verificação simples usando strings
  const start = startDate.split('T')[0]; // YYYY-MM-DD
  const end = endDate.split('T')[0];     // YYYY-MM-DD
  
  console.log('🕐 VALIDAÇÃO SIMPLIFICADA (STRINGS PURAS):', {
    start,
    end,
    isValid: start <= end
  });
  
  return start <= end;
};

console.log('🎯 VALIDAÇÃO SEMANAL RADICAL FINAL APLICADA - ZERO conversões Date');
