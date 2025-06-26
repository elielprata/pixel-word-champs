
/**
 * SISTEMA UNIFICADO DE TEMPO - BRASÍLIA
 * Re-exportação de todas as funções de tempo organizadas por módulos
 */

// Conversões principais
export {
  convertBrasiliaInputToUTC,
  formatUTCForDateTimeLocal,
  createBrasiliaTimestamp,
  getCurrentBrasiliaDate,
  getCurrentBrasiliaTime
} from './brasiliaCore';

// Formatação e exibição
export {
  formatTimeForDisplay,
  formatDateForDisplay,
  formatBrasiliaDate,
  formatDateInputToDisplay,
  formatWeeklyPeriodPreview,
  formatTimePreview,
  formatDatePreview
} from './brasiliaDisplay';

// Validações
export {
  validateCompetitionDuration,
  validateBrasiliaDateRange
} from './brasiliaValidation';

// Cálculos de tempo
export {
  calculateEndDateWithDuration,
  calculateTimeRemaining,
  calculateTimeRemainingFormatted
} from './brasiliaCalculations';

// Funções específicas para competições
export {
  calculateCompetitionStatus,
  isCompetitionActive,
  getCompetitionTimeRemaining,
  getCompetitionTimeRemainingText
} from './brasiliaCompetitions';
