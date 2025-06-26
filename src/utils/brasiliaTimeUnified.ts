/**
 * UTILITÁRIO UNIFICADO DE TEMPO - VERSÃO FINAL CORRIGIDA
 * REGRA DEFINITIVA: INPUT = EXIBIÇÃO (Brasília), UTC apenas para storage
 * CORREÇÃO FINAL: Eliminação completa de conversões duplas com parsing manual
 */

/**
 * ===========================================
 * FUNÇÕES PRINCIPAIS - CORRIGIDAS COM PARSING MANUAL
 * ===========================================
 */

/**
 * CORRIGIDO DEFINITIVAMENTE: Converte input Brasília para UTC com parsing manual
 * Input: 15:30 Brasília → Output: 18:30 UTC (mesmo dia)
 * Input: 23:00 Brasília → Output: 02:00 UTC (próximo dia)
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    console.log('🔄 CONVERSÃO BRASÍLIA → UTC (PARSING MANUAL):', {
      input: brasiliaDateTime,
      step: 'Início da conversão com parsing manual'
    });
    
    // CORREÇÃO DEFINITIVA: Parsing manual completo
    const parts = brasiliaDateTime.split(/[-T:]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months são 0-indexados
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]) || 0;
    const minute = parseInt(parts[4]) || 0;
    
    console.log('📋 Componentes parseados:', { year, month, day, hour, minute });
    
    // CORREÇÃO: Criar data UTC diretamente com +3h para converter Brasília → UTC
    // Brasília UTC-3, então para UTC: +3 horas
    const utcHour = hour + 3;
    const utcDate = new Date(Date.UTC(year, month, day, utcHour, minute));
    
    console.log('🌍 Conversão definitiva:', {
      brasiliaInput: brasiliaDateTime,
      parsedHour: hour,
      utcHour: utcHour,
      utcResult: utcDate.toISOString(),
      operation: 'Parsing manual + 3h (Brasília → UTC)'
    });
    
    return utcDate.toISOString();
  } catch (error) {
    console.error('❌ Erro ao converter Brasília para UTC com parsing manual:', error);
    return new Date().toISOString();
  }
};

/**
 * CORRIGIDO DEFINITIVAMENTE: Converte UTC para formato datetime-local (Brasília)
 * Input: 18:30 UTC → Output: 15:30 Brasília (para inputs de formulário)
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    console.log('🔄 UTC → Brasília (PARSING MANUAL):', {
      input: utcDateTime,
      step: 'Conversão controlada UTC → Brasília'
    });
    
    const utcDate = new Date(utcDateTime);
    
    // CORREÇÃO DEFINITIVA: Conversão controlada subtraindo exatamente 3h
    const brasiliaDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000)); // -3h em milissegundos
    
    const year = brasiliaDate.getUTCFullYear();
    const month = (brasiliaDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = brasiliaDate.getUTCDate().toString().padStart(2, '0');
    const hours = brasiliaDate.getUTCHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getUTCMinutes().toString().padStart(2, '0');
    
    const result = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    console.log('🔄 UTC → Brasília (conversão controlada):', {
      utcInput: utcDateTime,
      utcTime: utcDate.getTime(),
      brasiliaTime: brasiliaDate.getTime(),
      difference: (utcDate.getTime() - brasiliaDate.getTime()) / (60 * 60 * 1000),
      result: result,
      operation: 'UTC - 3h = Brasília'
    });
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao converter UTC para datetime-local:', error);
    return '';
  }
};

/**
 * CORRIGIDO DEFINITIVAMENTE: Calcula data de fim usando parsing manual
 */
export const calculateEndDateWithDuration = (startDateTimeBrasilia: string, durationHours: number): string => {
  if (!startDateTimeBrasilia || !durationHours) {
    return '';
  }
  
  try {
    console.log('⏰ CÁLCULO DE FIM (PARSING MANUAL):', {
      startInput: startDateTimeBrasilia,
      duration: durationHours
    });
    
    // CORREÇÃO: Parsing manual do horário de início
    const parts = startDateTimeBrasilia.split(/[-T:]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]) || 0;
    const minute = parseInt(parts[4]) || 0;
    
    // Calcular fim em Brasília (horário local)
    const endHour = hour + durationHours;
    
    // Verificar se ultrapassa 23:59 do mesmo dia
    const maxHour = 23;
    const maxMinute = 59;
    
    let finalHour = endHour;
    let finalMinute = minute;
    let finalDay = day;
    let finalMonth = month;
    let finalYear = year;
    
    if (endHour > maxHour || (endHour === maxHour && minute > maxMinute)) {
      // Limitar ao final do dia
      finalHour = maxHour;
      finalMinute = maxMinute;
    }
    
    // Criar string de fim em Brasília
    const finalBrasiliaString = `${finalYear}-${(finalMonth + 1).toString().padStart(2, '0')}-${finalDay.toString().padStart(2, '0')}T${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
    
    console.log('📊 Cálculo com parsing manual:', {
      startParsed: { year, month, day, hour, minute },
      endCalculated: { finalYear, finalMonth, finalDay, finalHour, finalMinute },
      brasiliaEnd: finalBrasiliaString,
      wasLimited: endHour > maxHour || (endHour === maxHour && minute > maxMinute)
    });
    
    // Converter resultado para UTC usando a função corrigida
    const utcResult = convertBrasiliaInputToUTC(finalBrasiliaString);
    
    console.log('✅ Resultado final (PARSING MANUAL):', {
      brasiliaEnd: finalBrasiliaString,
      utcEnd: utcResult,
      conversion: 'Usando função de parsing manual'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao calcular data de fim com parsing manual:', error);
    return '';
  }
};

/**
 * CORRIGIDO DEFINITIVAMENTE: Validação usando parsing manual
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
    // CORREÇÃO: Usar parsing manual
    const parts = startDateTimeBrasilia.split(/[-T:]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]) || 0;
    const minute = parseInt(parts[4]) || 0;
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      return { isValid: false, error: 'Data de início inválida' };
    }
    
    const endHour = hour + durationHours;
    const endMinute = minute;
    
    // Limite do mesmo dia em Brasília (23:59)
    const maxHour = 23;
    const maxMinute = 59;
    
    console.log('🔍 Validação (PARSING MANUAL):', {
      input: startDateTimeBrasilia,
      parsedComponents: { year, month, day, hour, minute },
      endHour: endHour,
      endMinute: endMinute,
      maxHour: maxHour,
      maxMinute: maxMinute,
      durationHours,
      willExceedLimit: endHour > maxHour || (endHour === maxHour && endMinute > maxMinute)
    });
    
    if (endHour > maxHour || (endHour === maxHour && endMinute > maxMinute)) {
      const maxDurationHours = maxHour - hour;
      const maxDurationMinutes = maxMinute - minute;
      const totalMaxDuration = maxDurationHours + (maxDurationMinutes / 60);
      
      return { 
        isValid: false, 
        error: `Duração máxima para este horário é de ${Math.floor(totalMaxDuration)} horas (até 23:59 do mesmo dia)` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('❌ Erro na validação de duração com parsing manual:', error);
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
    const brasiliaDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    
    const hours = brasiliaDate.getUTCHours().toString().padStart(2, '0');
    const minutes = brasiliaDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return '';
  }
};

export const formatDateForDisplay = (utcDateTime: string): string => {
  if (!utcDateTime) return 'Data inválida';
  
  try {
    const utcDate = new Date(utcDateTime);
    const brasiliaDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    
    const day = brasiliaDate.getUTCDate().toString().padStart(2, '0');
    const month = (brasiliaDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

export const formatBrasiliaDate = (date: Date | string | null | undefined, includeTime: boolean = true): string => {
  try {
    if (!date) return 'Data inválida';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const brasiliaTime = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000));
    
    const day = brasiliaTime.getUTCDate().toString().padStart(2, '0');
    const month = (brasiliaTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaTime.getUTCFullYear();
    
    if (!includeTime) {
      return `${day}/${month}/${year}`;
    }
    
    const hours = brasiliaTime.getUTCHours().toString().padStart(2, '0');
    const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = brasiliaTime.getUTCSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
 * CORRIGIDO: Obter horário atual formatado para Brasília
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

/**
 * CORRIGIDO: Formatar data para inputs
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const brasiliaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    
    const day = brasiliaDate.getUTCDate().toString().padStart(2, '0');
    const month = (brasiliaDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = brasiliaDate.getUTCFullYear();
    
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
