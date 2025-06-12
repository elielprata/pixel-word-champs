
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
  end_date: string; // Adicionado para corrigir os erros
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

  // Para competições diárias, end_date é o mesmo dia que start_date
  const endDateString = startDateString;

  const validatedData: DailyCompetitionData = {
    title: data.title,
    description: data.description,
    theme: data.theme || 'Geral',
    start_date: startDateString, // STRING SIMPLES - banco ajustará horários
    end_date: endDateString, // MESMO DIA - banco fará 23:59:59
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

/**
 * Função para formatar tempo de competição diária (adicionada para compatibilidade)
 */
export const formatDailyCompetitionTime = (dateString: string, isEndTime: boolean = false): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const timeString = isEndTime ? '23:59:59' : '00:00:00';
    return `${date.toLocaleDateString('pt-BR')} às ${timeString}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

console.log('🎯 VALIDAÇÃO DIÁRIA RADICAL FINAL APLICADA - ZERO CONVERSÕES PROBLEMÁTICAS');
