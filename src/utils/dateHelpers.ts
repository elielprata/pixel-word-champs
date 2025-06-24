
/**
 * Utilitários de data simplificados para evitar erros de timezone
 * Trabalha sempre com UTC e deixa conversões de exibição para o frontend
 */

/**
 * Converte string de data para UTC mantendo o formato ISO
 */
export const toUTCTimestamp = (dateString: string): string => {
  if (!dateString) return new Date().toISOString();
  
  // Se já tem timezone, usar como está
  if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
    return dateString;
  }
  
  // Se é apenas data (YYYY-MM-DD), assumir UTC
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateString}T00:00:00.000Z`;
  }
  
  // Para outros casos, tentar criar data e converter para ISO
  try {
    return new Date(dateString).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

/**
 * Cria timestamp para fim do dia em UTC (23:59:59)
 */
export const createEndOfDayUTC = (dateString: string): string => {
  const date = dateString.split('T')[0]; // Pegar apenas YYYY-MM-DD
  return `${date}T23:59:59.999Z`;
};

/**
 * Cria timestamp para início do dia em UTC (00:00:00)
 */
export const createStartOfDayUTC = (dateString: string): string => {
  const date = dateString.split('T')[0]; // Pegar apenas YYYY-MM-DD
  return `${date}T00:00:00.000Z`;
};

/**
 * Formata data para exibição no formato brasileiro
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'Data inválida';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Verifica se uma data está no passado
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  } catch {
    return false;
  }
};

/**
 * Valida se string de data está em formato válido
 */
export const isValidDateString = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};
