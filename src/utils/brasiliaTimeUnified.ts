
/**
 * UTILITÁRIO UNIFICADO DE TEMPO - VERSÃO CORRIGIDA
 * PRINCÍPIO: UTC para processamento interno, Brasília apenas para exibição
 * ZERO conversões de timezone desnecessárias
 */

/**
 * Converte input do usuário (Brasília) para UTC uma única vez
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    // Criar data interpretando como Brasília (UTC-3)
    const brasiliaDate = new Date(brasiliaDateTime + ':00'); // Garantir formato completo
    
    // Ajustar para UTC (adicionar 3 horas)
    const utcDate = new Date(brasiliaDate.getTime() + (3 * 60 * 60 * 1000));
    
    return utcDate.toISOString();
  } catch (error) {
    console.error('Erro ao converter Brasília para UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * Calcula data de fim baseada em UTC puro + duração
 * SEM conversões de timezone - cálculo matemático direto
 */
export const calculateEndDateWithDuration = (startDateTimeUTC: string, durationHours: number): string => {
  if (!startDateTimeUTC || !durationHours) {
    return '';
  }
  
  try {
    // Trabalhar em UTC puro
    const startDate = new Date(startDateTimeUTC);
    const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Calcular limite do mesmo dia em UTC
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setUTCHours(23, 59, 59, 999);
    
    // Se ultrapassar o limite, ajustar
    if (endDate > sameDayLimit) {
      return sameDayLimit.toISOString();
    }
    
    return endDate.toISOString();
  } catch (error) {
    console.error('Erro ao calcular data de fim:', error);
    return '';
  }
};

/**
 * Valida duração sem conversões de timezone
 */
export const validateCompetitionDuration = (startDateTimeUTC: string, durationHours: number): { isValid: boolean; error?: string } => {
  if (!startDateTimeUTC) {
    return { isValid: false, error: 'Data de início é obrigatória' };
  }
  
  if (!durationHours || durationHours < 1) {
    return { isValid: false, error: 'Duração deve ser de pelo menos 1 hora' };
  }
  
  if (durationHours > 12) {
    return { isValid: false, error: 'Duração máxima é de 12 horas' };
  }
  
  const startDate = new Date(startDateTimeUTC);
  const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
  
  const sameDayLimit = new Date(startDate);
  sameDayLimit.setUTCHours(23, 59, 59, 999);
  
  if (endDate > sameDayLimit) {
    const maxDurationHours = Math.floor((sameDayLimit.getTime() - startDate.getTime()) / (60 * 60 * 1000));
    return { 
      isValid: false, 
      error: `Duração máxima para este horário é de ${maxDurationHours} horas (até 23:59:59)` 
    };
  }
  
  return { isValid: true };
};

/**
 * Formata horário UTC para exibição em Brasília - SEM conversão adicional
 * O dado já vem do banco em UTC, extrair apenas HH:MM
 */
export const formatTimeForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const date = new Date(utcDateTime);
    // Subtrair 3 horas para exibir em horário de Brasília
    const brasiliaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    const hours = brasiliaDate.getUTCHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return '';
  }
};

/**
 * Formata data UTC para exibição em Brasília - SEM conversão adicional
 */
export const formatDateForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return 'Data inválida';
  
  try {
    const date = new Date(utcDateTime);
    // Subtrair 3 horas para exibir em horário de Brasília
    const brasiliaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    const day = brasiliaDate.getUTCDate().toString().padStart(2, '0');
    const month = (brasiliaDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * Converte UTC para formato datetime-local (para inputs de formulário)
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const date = new Date(utcDateTime);
    // Subtrair 3 horas para exibir em horário de Brasília
    const brasiliaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    
    const year = brasiliaDate.getUTCFullYear();
    const month = (brasiliaDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = brasiliaDate.getUTCDate().toString().padStart(2, '0');
    const hours = brasiliaDate.getUTCHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getUTCMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar para datetime-local:', error);
    return '';
  }
};

/**
 * Calcula status da competição baseado em UTC
 */
export const calculateCompetitionStatus = (
  startDateUTC: string, 
  endDateUTC: string
): 'scheduled' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDateUTC);
  const end = new Date(endDateUTC);

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Obter data/hora atual em Brasília para referência do usuário
 */
export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  
  const year = brasiliaTime.getUTCFullYear();
  const month = (brasiliaTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = brasiliaTime.getUTCDate().toString().padStart(2, '0');
  const hours = brasiliaTime.getUTCHours().toString().padStart(2, '0');
  const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Manter compatibilidade com código existente
export const formatTimePreview = formatTimeForDisplay;
export const formatDatePreview = formatDateForDisplay;
export const isCompetitionActive = (start: string, end: string) => calculateCompetitionStatus(start, end) === 'active';
