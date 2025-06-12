
/**
 * VALIDAÇÃO DIÁRIA RADICAL SIMPLIFICADA - VERSÃO FINAL
 * 
 * CORREÇÃO RADICAL: Eliminar TODAS as conversões problemáticas
 * Trabalhar apenas com strings simples de data
 * Deixar APENAS o trigger do banco fazer a padronização
 */

export interface DailyCompetitionData {
  title: string;
  description: string;
  theme: string;
  start_date: string;
  competition_type: 'challenge';
}

/**
 * CORREÇÃO RADICAL FINAL: Validação SEM conversões de timezone
 * Apenas validação de campos obrigatórios e formatação simples
 */
export const validateDailyCompetitionData = (data: Partial<DailyCompetitionData>): DailyCompetitionData => {
  console.log('🔧 VALIDAÇÃO RADICAL FINAL (SEM CONVERSÕES):', data);
  
  if (!data.title || !data.description) {
    throw new Error('Título e descrição são obrigatórios para competição diária');
  }

  // RADICAL: Usar a data como string simples, SEM conversões
  let startDateString = data.start_date;
  
  if (!startDateString) {
    // Se não fornecida, usar data atual como string simples
    const today = new Date();
    startDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  const validatedData: DailyCompetitionData = {
    title: data.title,
    description: data.description,
    theme: data.theme || 'Geral',
    start_date: startDateString, // STRING SIMPLES - banco ajustará horários
    competition_type: 'challenge'
  };

  console.log('🎯 RADICAL: Dados validados SEM conversões (trigger do banco fará tudo):', validatedData);
  return validatedData;
};

/**
 * Verificação SIMPLIFICADA - apenas formato básico
 */
export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  console.log('🕐 VERIFICAÇÃO RADICAL SIMPLIFICADA:', { startDate, endDate });
  
  // Verificação básica: se as datas são strings válidas
  const isStartValid = !!startDate && startDate.length >= 10;
  const isEndValid = !!endDate && endDate.length >= 10;
  
  console.log('✅ VALIDAÇÃO SIMPLES:', { isStartValid, isEndValid });
  return isStartValid && isEndValid;
};

console.log('🎯 VALIDAÇÃO DIÁRIA RADICAL FINAL APLICADA - ZERO CONVERSÕES PROBLEMÁTICAS');
