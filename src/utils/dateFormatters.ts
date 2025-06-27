
/**
 * Utilitários de formatação de data para exibição
 */

/**
 * Formatar data YYYY-MM-DD para DD/MM/YYYY
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Formatar período de datas para exibição
 */
export const formatDatePeriod = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '';
  
  return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
};
