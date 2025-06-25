/**
 * UTILITÁRIO UNIFICADO DE TEMPO PARA BRASÍLIA
 * Todas as funções trabalham exclusivamente com horário de Brasília (UTC-3)
 * Sistema simplificado após correção do trigger do banco
 */

/**
 * Obtém a data atual no horário de Brasília
 */
export const getCurrentBrasiliaDate = (): Date => {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return brasiliaTime;
};

/**
 * Cria uma data em Brasília a partir de uma string de data
 */
export const createBrasiliaDateFromString = (dateString: string): Date => {
  if (!dateString) return getCurrentBrasiliaDate();
  
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const brasiliaDate = new Date();
    brasiliaDate.setFullYear(year, month - 1, day);
    brasiliaDate.setHours(0, 0, 0, 0);
    
    const offset = brasiliaDate.getTimezoneOffset();
    const brasiliaOffset = 180;
    const adjustment = (offset - brasiliaOffset) * 60000;
    
    return new Date(brasiliaDate.getTime() + adjustment);
  }
  
  return new Date(dateString);
};

/**
 * Formata uma data para exibição no padrão brasileiro
 */
export const formatBrasiliaDate = (date: Date | string, includeTime: boolean = true): string => {
  if (!date) return 'Data inválida';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  }
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return 'Data inválida';
  }
  
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Cria um timestamp em Brasília a partir de uma string de data
 */
export const createBrasiliaTimestamp = (dateString: string, endOfDay: boolean = false): string => {
  if (!dateString) return getCurrentBrasiliaDate().toISOString();
  
  const date = new Date(dateString);
  
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  
  return date.toISOString();
};

/**
 * Calcula a data de fim baseada na data de início e duração em horas
 * VERSÃO SIMPLIFICADA - o trigger do banco agora respeita esta data
 */
export const calculateEndDateWithDuration = (startDateTime: string, durationHours: number): string => {
  if (!startDateTime || !durationHours) {
    return '';
  }
  
  try {
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Verificar limite do mesmo dia (o trigger do banco fará a validação final)
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setHours(23, 59, 59, 999);
    
    if (endDate > sameDayLimit) {
      return sameDayLimit.toISOString();
    }
    
    return endDate.toISOString();
  } catch (error) {
    console.error('Erro em calculateEndDateWithDuration:', error);
    return '';
  }
};

/**
 * Valida se uma duração é válida para uma data de início
 */
export const validateCompetitionDuration = (startDateTime: string, durationHours: number): { isValid: boolean; error?: string } => {
  if (!startDateTime) {
    return { isValid: false, error: 'Data de início é obrigatória' };
  }
  
  if (!durationHours || durationHours < 1) {
    return { isValid: false, error: 'Duração deve ser de pelo menos 1 hora' };
  }
  
  if (durationHours > 12) {
    return { isValid: false, error: 'Duração máxima é de 12 horas' };
  }
  
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
  
  const sameDayLimit = new Date(startDate);
  sameDayLimit.setHours(23, 59, 59, 999);
  
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
 * Formata horário de preview para exibição
 * VERSÃO SIMPLIFICADA
 */
export const formatTimePreview = (dateTime: string): string => {
  if (!dateTime) return '';
  
  try {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  } catch (error) {
    return '';
  }
};

/**
 * Compara duas datas em Brasília
 */
export const compareBrasiliaDates = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getTime() - d2.getTime();
};

/**
 * Valida se uma data de início é anterior à data de fim
 */
export const validateBrasiliaDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false;
  return startDate < endDate;
};

/**
 * Obtém os limites de uma semana em Brasília
 */
export const getBrasiliaWeekBoundaries = (
  startDayOfWeek: number = 0,
  durationDays: number = 7,
  customStartDate?: string,
  customEndDate?: string
): { start: string; end: string } => {
  
  if (customStartDate && customEndDate) {
    return {
      start: customStartDate,
      end: customEndDate
    };
  }
  
  const now = getCurrentBrasiliaDate();
  const startOfWeek = new Date(now);
  
  const currentDay = startOfWeek.getDay();
  const daysToSubtract = (currentDay - startDayOfWeek + 7) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + durationDays - 1);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  };
};

/**
 * Calcula a diferença em dias entre duas datas
 */
export const calculateDaysDifference = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Formata o preview de período para exibição no modal
 */
export const formatWeeklyPeriodPreview = (
  configType: 'weekly' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  startDayOfWeek?: number,
  durationDays?: number
): string => {
  if (configType === 'custom') {
    if (!customStartDate || !customEndDate) {
      return 'Selecione as datas';
    }
    
    if (!validateBrasiliaDateRange(customStartDate, customEndDate)) {
      return 'Intervalo de datas inválido';
    }
    
    const startFormatted = formatDateInputToDisplay(customStartDate);
    const endFormatted = formatDateInputToDisplay(customEndDate);
    
    return `${startFormatted} a ${endFormatted}`;
  }
  
  const DAYS_OF_WEEK = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  
  const startDay = DAYS_OF_WEEK[startDayOfWeek ?? 0];
  const endDayIndex = ((startDayOfWeek ?? 0) + (durationDays ?? 7) - 1) % 7;
  const endDay = DAYS_OF_WEEK[endDayIndex];
  
  return `${startDay} a ${endDay} (${durationDays ?? 7} dias)`;
};

/**
 * Calcula o status correto de uma competição baseado nas datas (em Brasília)
 */
export const calculateCompetitionStatus = (
  startDate: string, 
  endDate: string
): 'scheduled' | 'active' | 'completed' => {
  const now = getCurrentBrasiliaDate();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Verifica se uma competição está ativa no momento (em Brasília)
 */
export const isCompetitionActive = (startDate: string, endDate: string): boolean => {
  const status = calculateCompetitionStatus(startDate, endDate);
  return status === 'active';
};

/**
 * Calcula tempo restante em segundos (em Brasília)
 */
export const calculateTimeRemaining = (endDate: string): number => {
  const now = getCurrentBrasiliaDate();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  return remainingSeconds;
};

/**
 * Verifica se uma data está no passado (em Brasília)
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = getCurrentBrasiliaDate();
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
