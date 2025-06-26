
/**
 * FORMATAÇÃO E EXIBIÇÃO
 * Funções para formatar datas e horários para exibição
 */

export const formatTimeForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const utcDate = new Date(utcDateTime);
    return utcDate.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return '';
  }
};

export const formatDateForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return 'Data inválida';
  
  try {
    const utcDate = new Date(utcDateTime);
    return utcDate.toLocaleDateString('pt-BR', { 
      timeZone: 'America/Sao_Paulo' 
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

export const formatBrasiliaDate = (date: Date | string | null | undefined, includeTime: boolean = true): string => {
  try {
    if (!date) return 'Data inválida';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (includeTime) {
      return dateObj.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo' 
      });
    }
    
    return dateObj.toLocaleDateString('pt-BR', { 
      timeZone: 'America/Sao_Paulo' 
    });
  } catch (error) {
    console.error('Erro ao formatar data Brasília:', error);
    return 'Data inválida';
  }
};

/**
 * Formatar data para inputs
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      timeZone: 'America/Sao_Paulo' 
    });
  } catch (error) {
    console.error('Erro ao formatar data para input:', error);
    return '';
  }
};

/**
 * Preview de período semanal
 */
export const formatWeeklyPeriodPreview = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '';
  
  try {
    const start = formatDateInputToDisplay(startDate);
    const end = formatDateInputToDisplay(endDate);
    return `${start} - ${end}`;
  } catch (error) {
    console.error('Erro ao formatar período semanal:', error);
    return '';
  }
};

// Aliases para compatibilidade
export const formatTimePreview = formatTimeForDisplay;
export const formatDatePreview = formatDateForDisplay;
