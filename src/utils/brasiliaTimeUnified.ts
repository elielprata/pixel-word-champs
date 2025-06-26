
/**
 * UTILITÁRIO UNIFICADO DE TEMPO - VERSÃO CORRIGIDA FINAL
 * REGRA DEFINITIVA: INPUT = EXIBIÇÃO (Brasília), UTC apenas para storage
 * CORREÇÃO: Eliminação de conversões duplas e lógica inconsistente
 */

/**
 * ===========================================
 * FUNÇÕES PRINCIPAIS - CORRIGIDAS PARA ELIMINAR CONVERSÕES DUPLAS
 * ===========================================
 */

/**
 * CORRIGIDO: Converte input Brasília para UTC SEM conversão dupla
 * Input: 15:30 Brasília → Output: 18:30 UTC (mesmo dia)
 * Input: 23:00 Brasília → Output: 02:00 UTC (próximo dia)
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    console.log('🔄 CONVERSÃO BRASÍLIA → UTC (CORRIGIDA):', {
      input: brasiliaDateTime,
      step: 'Início da conversão sem duplicação'
    });
    
    // CORREÇÃO: Parsing direto como datetime local (Brasília)
    const brasiliaDate = new Date(brasiliaDateTime);
    
    // CORREÇÃO: Adicionar apenas 3 horas para UTC (não usar getTime() + offset)
    // Brasília é UTC-3, então para UTC: +3 horas
    const utcDate = new Date(brasiliaDate);
    utcDate.setHours(utcDate.getHours() + 3);
    
    console.log('🌍 Conversão corrigida:', {
      brasiliaInput: brasiliaDateTime,
      brasiliaHours: brasiliaDate.getHours(),
      utcHours: utcDate.getHours(),
      utcResult: utcDate.toISOString(),
      operation: '+3h (Brasília → UTC)'
    });
    
    return utcDate.toISOString();
  } catch (error) {
    console.error('❌ Erro ao converter Brasília para UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * CORRIGIDO: Converte UTC para formato datetime-local (Brasília)
 * Input: 18:30 UTC → Output: 15:30 Brasília (para inputs de formulário)
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const utcDate = new Date(utcDateTime);
    
    // CORREÇÃO: Subtrair 3 horas para converter UTC → Brasília
    const brasiliaDate = new Date(utcDate);
    brasiliaDate.setHours(brasiliaDate.getHours() - 3);
    
    const year = brasiliaDate.getFullYear();
    const month = (brasiliaDate.getMonth() + 1).toString().padStart(2, '0');
    const day = brasiliaDate.getDate().toString().padStart(2, '0');
    const hours = brasiliaDate.getHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getMinutes().toString().padStart(2, '0');
    
    const result = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    console.log('🔄 UTC → Brasília (datetime-local):', {
      utcInput: utcDateTime,
      utcHours: utcDate.getHours(),
      brasiliaHours: brasiliaDate.getHours(),
      result: result,
      operation: '-3h (UTC → Brasília)'
    });
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao formatar UTC para datetime-local:', error);
    return '';
  }
};

/**
 * CORRIGIDO: Calcula data de fim mantendo lógica em Brasília sem conversões extras
 */
export const calculateEndDateWithDuration = (startDateTimeBrasilia: string, durationHours: number): string => {
  if (!startDateTimeBrasilia || !durationHours) {
    return '';
  }
  
  try {
    console.log('⏰ CÁLCULO DE FIM (Brasília - CORRIGIDO):', {
      startInput: startDateTimeBrasilia,
      duration: durationHours
    });
    
    // CORREÇÃO: Trabalhar diretamente em Brasília, sem conversões intermediárias
    const brasiliaStart = new Date(startDateTimeBrasilia);
    
    // Calcular fim em Brasília
    const brasiliaEnd = new Date(brasiliaStart);
    brasiliaEnd.setHours(brasiliaEnd.getHours() + durationHours);
    
    // Calcular limite do mesmo dia (23:59:59)
    const sameDayLimit = new Date(brasiliaStart);
    sameDayLimit.setHours(23, 59, 59, 999);
    
    console.log('📊 Cálculo em Brasília (CORRIGIDO):', {
      start: brasiliaStart.toLocaleString('pt-BR'),
      calculatedEnd: brasiliaEnd.toLocaleString('pt-BR'),
      limit: sameDayLimit.toLocaleString('pt-BR'),
      willLimit: brasiliaEnd > sameDayLimit
    });
    
    // Se ultrapassar o limite, ajustar
    const finalBrasiliaEnd = brasiliaEnd > sameDayLimit ? sameDayLimit : brasiliaEnd;
    
    // CORREÇÃO: Usar função de conversão corrigida
    const finalBrasiliaEndString = finalBrasiliaEnd.getFullYear() + '-' +
      (finalBrasiliaEnd.getMonth() + 1).toString().padStart(2, '0') + '-' +
      finalBrasiliaEnd.getDate().toString().padStart(2, '0') + 'T' +
      finalBrasiliaEnd.getHours().toString().padStart(2, '0') + ':' +
      finalBrasiliaEnd.getMinutes().toString().padStart(2, '0');
    
    const utcResult = convertBrasiliaInputToUTC(finalBrasiliaEndString);
    
    console.log('✅ Resultado final (CORRIGIDO):', {
      brasiliaEnd: finalBrasiliaEndString,
      utcEnd: utcResult,
      conversion: 'Usando função corrigida'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao calcular data de fim:', error);
    return '';
  }
};

/**
 * CORRIGIDO: Validação em horário de Brasília sem conversões extras
 */
export const validateCompetitionDuration = (startDateTimeBrasilia: string, durationHours: number): { isValid: boolean; error?: string } => {
  if (!startDateTimeBrasilia) {
    return { isValid: false, error: 'Data de início é obrigatória' };
  }
  
  if (!durationHours || durationHours < 1) {
    return { isValid: false, error: 'Duração deve ser de pelo menos 1 hora' };
  }
  
  if (durationHours > 12) {
    return { isValid: false, error: 'Duração máxima é de 12 horas' };
  }
  
  try {
    // CORREÇÃO: Trabalhar diretamente em Brasília
    const startDate = new Date(startDateTimeBrasilia);
    
    if (isNaN(startDate.getTime())) {
      return { isValid: false, error: 'Data de início inválida' };
    }
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + durationHours);
    
    // Limite do mesmo dia em Brasília
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setHours(23, 59, 59, 999);
    
    console.log('🔍 Validação (Brasília - CORRIGIDA):', {
      input: startDateTimeBrasilia,
      startDate: startDate.toLocaleString('pt-BR'),
      endDate: endDate.toLocaleString('pt-BR'),
      sameDayLimit: sameDayLimit.toLocaleString('pt-BR'),
      durationHours,
      isValid: endDate <= sameDayLimit
    });
    
    if (endDate > sameDayLimit) {
      const maxEndTime = new Date(sameDayLimit);
      const maxDurationMs = maxEndTime.getTime() - startDate.getTime();
      const maxDurationHours = Math.floor(maxDurationMs / (60 * 60 * 1000));
      
      return { 
        isValid: false, 
        error: `Duração máxima para este horário é de ${maxDurationHours} horas (até 23:59:59 do mesmo dia)` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('❌ Erro na validação de duração:', error);
    return { isValid: false, error: 'Erro na validação da duração' };
  }
};

/**
 * ===========================================
 * FUNÇÕES DE EXIBIÇÃO - CORRIGIDAS PARA UTC → BRASÍLIA
 * ===========================================
 */

/**
 * CORRIGIDO: Formata horário UTC para exibição em Brasília
 */
export const formatTimeForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const utcDate = new Date(utcDateTime);
    const brasiliaDate = new Date(utcDate);
    brasiliaDate.setHours(brasiliaDate.getHours() - 3); // UTC → Brasília (-3h)
    
    const hours = brasiliaDate.getHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return '';
  }
};

/**
 * CORRIGIDO: Formata data UTC para exibição em Brasília
 */
export const formatDateForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return 'Data inválida';
  
  try {
    const utcDate = new Date(utcDateTime);
    const brasiliaDate = new Date(utcDate);
    brasiliaDate.setHours(brasiliaDate.getHours() - 3); // UTC → Brasília (-3h)
    
    const day = brasiliaDate.getDate().toString().padStart(2, '0');
    const month = (brasiliaDate.getMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaDate.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * ===========================================
 * FUNÇÕES UNIVERSAIS - CORRIGIDAS PARA COMPATIBILIDADE
 * ===========================================
 */

/**
 * CORRIGIDO: Formatar data UTC para exibição Brasília
 */
export const formatBrasiliaDate = (date: Date | string | null | undefined, includeTime: boolean = true): string => {
  try {
    if (!date) return 'Data inválida';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // CORREÇÃO: Converter UTC → Brasília (-3h) para exibição
    const brasiliaTime = new Date(dateObj);
    brasiliaTime.setHours(brasiliaTime.getHours() - 3);
    
    const day = brasiliaTime.getDate().toString().padStart(2, '0');
    const month = (brasiliaTime.getMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaTime.getFullYear();
    
    if (!includeTime) {
      return `${day}/${month}/${year}`;
    }
    
    const hours = brasiliaTime.getHours().toString().padStart(2, '0');
    const minutes = brasiliaTime.getMinutes().toString().padStart(2, '0');
    const seconds = brasiliaTime.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Erro ao formatar data Brasília:', error);
    return 'Data inválida';
  }
};

/**
 * Criar timestamp UTC para banco de dados
 */
export const createBrasiliaTimestamp = (date?: Date | string | null): string => {
  if (!date) {
    return new Date().toISOString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  
  return date.toISOString();
};

/**
 * Obter data/hora atual em Brasília
 */
export const getCurrentBrasiliaDate = (): Date => {
  return new Date();
};

/**
 * CORRIGIDO: Obter horário atual formatado para Brasília
 */
export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  // CORREÇÃO: Converter UTC → Brasília (-3h) para exibição
  const brasiliaTime = new Date(now);
  brasiliaTime.setHours(brasiliaTime.getHours() - 3);
  
  const year = brasiliaTime.getFullYear();
  const month = (brasiliaTime.getMonth() + 1).toString().padStart(2, '0');
  const day = brasiliaTime.getDate().toString().padStart(2, '0');
  const hours = brasiliaTime.getHours().toString().padStart(2, '0');
  const minutes = brasiliaTime.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * CORRIGIDO: Formatar data para inputs
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // CORREÇÃO: Converter UTC → Brasília (-3h) para exibição
    const brasiliaDate = new Date(date);
    brasiliaDate.setHours(brasiliaDate.getHours() - 3);
    
    const day = brasiliaDate.getDate().toString().padStart(2, '0');
    const month = (brasiliaDate.getMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaDate.getFullYear();
    
    return `${day}/${month}/${year}`;
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

/**
 * Validar range de datas Brasília
 */
export const validateBrasiliaDateRange = (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Datas de início e fim são obrigatórias' };
  }
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return { isValid: false, error: 'Data de início deve ser anterior à data de fim' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Datas inválidas' };
  }
};

/**
 * Calcular tempo restante em milissegundos
 */
export const calculateTimeRemaining = (endDateUTC: string): number => {
  if (!endDateUTC) return 0;
  
  try {
    const now = new Date();
    const end = new Date(endDateUTC);
    const diff = end.getTime() - now.getTime();
    
    return Math.max(0, diff);
  } catch (error) {
    console.error('Erro ao calcular tempo restante:', error);
    return 0;
  }
};

/**
 * Calcular tempo restante formatado
 */
export const calculateTimeRemainingFormatted = (endDateUTC: string): string => {
  if (!endDateUTC) return '';
  
  try {
    const diff = calculateTimeRemaining(endDateUTC);
    
    if (diff <= 0) return 'Finalizado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  } catch (error) {
    console.error('Erro ao calcular tempo restante:', error);
    return '';
  }
};

/**
 * ===========================================
 * FUNÇÕES DE ESTADO - LÓGICA PURA UTC
 * ===========================================
 */

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
 * ===========================================
 * COMPATIBILIDADE - MANTER CÓDIGO EXISTENTE FUNCIONANDO
 * ===========================================
 */

// Manter compatibilidade com código existente
export const formatTimePreview = formatTimeForDisplay;
export const formatDatePreview = formatDateForDisplay;
export const isCompetitionActive = (start: string, end: string) => calculateCompetitionStatus(start, end) === 'active';

// Funções específicas para competições
export const getCompetitionTimeRemaining = (endDate: string): number => {
  const remaining = calculateTimeRemaining(endDate);
  return Math.max(0, Math.floor(remaining / 1000)); // Retornar em segundos
};

export const getCompetitionTimeRemainingText = (endDate: string): string => {
  return calculateTimeRemainingFormatted(endDate);
};
