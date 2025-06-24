
/**
 * Utilitários específicos para formatação de datas semanais
 * Evita problemas de timezone em configurações de período
 */

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 * Trabalha diretamente com a string para evitar problemas de timezone
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return 'Data inválida';
  }
  
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Valida se uma data de início é anterior à data de fim
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false;
  
  // Comparação direta de strings no formato YYYY-MM-DD
  return startDate < endDate;
};

/**
 * Calcula a diferença em dias entre duas datas
 */
export const calculateDaysDifference = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');
  
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
    
    if (!isValidDateRange(customStartDate, customEndDate)) {
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
