/**
 * UTILITÁRIO UNIFICADO DE TEMPO - VERSÃO CORRIGIDA DEFINITIVA
 * CORREÇÃO: Eliminação completa da duplicação de timezone
 * REGRA: INPUT = EXIBIÇÃO (Brasília), conversão direta sem adições extras
 */

/**
 * ===========================================
 * FUNÇÕES PRINCIPAIS - CORRIGIDAS SEM DUPLICAÇÃO
 * ===========================================
 */

/**
 * CORRIGIDO: Converte input datetime-local para UTC sem duplicação
 * Input: 15:30 Brasília → Output: 18:30 UTC (correto: +3h apenas uma vez)
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    console.log('🔄 CONVERSÃO BRASÍLIA → UTC (SEM DUPLICAÇÃO):', {
      input: brasiliaDateTime,
      step: 'Conversão direta sem adições extras'
    });
    
    // CORREÇÃO DEFINITIVA: Usar Date diretamente sem parsing manual
    // O datetime-local já é interpretado no timezone local do sistema
    const brasiliaDate = new Date(brasiliaDateTime);
    
    // Verificar se a data é válida
    if (isNaN(brasiliaDate.getTime())) {
      console.error('❌ Data inválida:', brasiliaDateTime);
      return new Date().toISOString();
    }
    
    // A conversão para UTC é automática pelo toISOString()
    const utcResult = brasiliaDate.toISOString();
    
    console.log('✅ Conversão sem duplicação:', {
      brasiliaInput: brasiliaDateTime,
      brasiliaTime: brasiliaDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      utcResult: utcResult,
      operation: 'Conversão direta sem adições manuais'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao converter Brasília para UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * CORRIGIDO: Converte UTC para formato datetime-local (Brasília) sem duplicação
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    console.log('🔄 UTC → Brasília (SEM DUPLICAÇÃO):', {
      input: utcDateTime,
      step: 'Conversão usando toLocaleString'
    });
    
    const utcDate = new Date(utcDateTime);
    
    // CORREÇÃO: Usar toLocaleString para conversão automática
    const brasiliaString = utcDate.toLocaleString('sv-SE', { 
      timeZone: 'America/Sao_Paulo' 
    }).replace(' ', 'T').slice(0, 16);
    
    console.log('✅ UTC → Brasília (sem duplicação):', {
      utcInput: utcDateTime,
      brasiliaResult: brasiliaString,
      operation: 'Conversão automática via toLocaleString'
    });
    
    return brasiliaString;
  } catch (error) {
    console.error('❌ Erro ao converter UTC para datetime-local:', error);
    return '';
  }
};

/**
 * CORRIGIDO: Calcula data de fim sem duplicação de timezone
 */
export const calculateEndDateWithDuration = (startDateTimeBrasilia: string, durationHours: number): string => {
  if (!startDateTimeBrasilia || !durationHours) {
    return '';
  }
  
  try {
    console.log('⏰ CÁLCULO DE FIM (SEM DUPLICAÇÃO):', {
      startInput: startDateTimeBrasilia,
      duration: durationHours
    });
    
    // CORREÇÃO: Trabalhar diretamente com Date sem conversões manuais
    const startDate = new Date(startDateTimeBrasilia);
    
    // Calcular fim adicionando duração em milissegundos
    const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Verificar limite do mesmo dia (23:59:59)
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setHours(23, 59, 59, 999);
    
    const finalEndDate = endDate > sameDayLimit ? sameDayLimit : endDate;
    
    console.log('📊 Cálculo sem duplicação:', {
      startTime: startDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      calculatedEnd: endDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      finalEnd: finalEndDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      wasLimited: endDate > sameDayLimit,
      durationUsed: durationHours
    });
    
    // Converter resultado final para UTC
    const utcResult = finalEndDate.toISOString();
    
    console.log('✅ Resultado final (SEM DUPLICAÇÃO):', {
      brasiliaEnd: finalEndDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      utcEnd: utcResult,
      conversion: 'Conversão direta sem duplicação'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao calcular data de fim:', error);
    return '';
  }
};

/**
 * CORRIGIDO: Validação sem duplicação de timezone
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
    console.log('🔍 Validação (SEM DUPLICAÇÃO):', {
      input: startDateTimeBrasilia,
      duration: durationHours
    });
    
    // CORREÇÃO: Usar Date diretamente
    const startDate = new Date(startDateTimeBrasilia);
    
    if (isNaN(startDate.getTime())) {
      return { isValid: false, error: 'Data de início inválida' };
    }
    
    const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Limite do mesmo dia (23:59:59)
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setHours(23, 59, 59, 999);
    
    console.log('🔍 Validação sem duplicação:', {
      startTime: startDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      endTime: endDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      limit: sameDayLimit.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      willExceed: endDate > sameDayLimit,
      duration: durationHours
    });
    
    if (endDate > sameDayLimit) {
      const maxDurationMs = sameDayLimit.getTime() - startDate.getTime();
      const maxDurationHours = Math.floor(maxDurationMs / (60 * 60 * 1000));
      
      return { 
        isValid: false, 
        error: `Duração máxima para este horário é de ${maxDurationHours} horas (até 23:59 do mesmo dia)` 
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
 * FUNÇÕES DE EXIBIÇÃO - MANTIDAS IGUAIS
 * ===========================================
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
 * ===========================================
 * FUNÇÕES UNIVERSAIS - MANTIDAS IGUAIS
 * ===========================================
 */

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
 * Obter horário atual formatado para Brasília
 */
export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  return now.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo' 
  });
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
