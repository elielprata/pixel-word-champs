
/**
 * UTILITÁRIO UNIFICADO DE TEMPO - VERSÃO PADRONIZAÇÃO UNIVERSAL
 * PRINCÍPIO DEFINITIVO: UTC para tudo, Brasília APENAS para exibição final
 * ZERO conversões desnecessárias em qualquer lugar do sistema
 */

/**
 * ===========================================
 * FUNÇÕES PRINCIPAIS - PADRÃO UNIVERSAL
 * ===========================================
 */

/**
 * Parser seguro para datas brasileiras
 * Converte formato brasileiro para formato que o JavaScript entende
 */
const parseBrazilianDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  try {
    // Se já está em formato ISO ou datetime-local, usar direto
    if (dateString.includes('T') || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateString);
    }
    
    // Se está em formato brasileiro DD/MM/YYYY HH:mm ou DD/MM/YYYY
    if (dateString.includes('/')) {
      const parts = dateString.split(' ');
      const datePart = parts[0]; // DD/MM/YYYY
      const timePart = parts[1] || '00:00'; // HH:mm (opcional)
      
      const [day, month, year] = datePart.split('/');
      
      // Converter para formato ISO: YYYY-MM-DDTHH:mm
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
      return new Date(isoString);
    }
    
    // Fallback para outros formatos
    return new Date(dateString);
  } catch (error) {
    console.error('Erro ao fazer parse da data brasileira:', error, dateString);
    return new Date();
  }
};

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
 * Valida duração SEM conversões de timezone - CORRIGIDO COM PARSER SEGURO
 * TODOS OS INPUTS JÁ ESTÃO EM HORÁRIO DE BRASÍLIA
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
    // Usar parser seguro para datas brasileiras
    const startDate = parseBrazilianDate(startDateTimeBrasilia);
    
    // Verificar se a data foi parseada corretamente
    if (isNaN(startDate.getTime())) {
      console.error('Data inválida após parsing:', startDateTimeBrasilia);
      return { isValid: false, error: 'Data de início inválida' };
    }
    
    const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Criar limite do mesmo dia (23:59:59) em horário de Brasília
    const sameDayLimit = new Date(startDate);
    sameDayLimit.setHours(23, 59, 59, 999); // setHours ao invés de setUTCHours
    
    console.log('🔍 Validação de duração:', {
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
    console.error('Erro na validação de duração:', error);
    return { isValid: false, error: 'Erro na validação da duração' };
  }
};

/**
 * ===========================================
 * FUNÇÕES DE EXIBIÇÃO - CONVERSÃO FINAL PARA BRASÍLIA
 * ===========================================
 */

/**
 * Formata horário UTC para exibição em Brasília
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
 * Formata data UTC para exibição em Brasília
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
 * ===========================================
 * FUNÇÕES UNIVERSAIS - CORRIGIDAS PARA COMPATIBILIDADE
 * ===========================================
 */

/**
 * Formatar data UTC para exibição Brasília - ASSINATURA CORRIGIDA
 */
export const formatBrasiliaDate = (date: Date | string | null | undefined, includeTime: boolean = true): string => {
  try {
    if (!date) return 'Data inválida';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Converter para Brasília (UTC-3) apenas para exibição
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
 * Criar timestamp UTC para banco de dados - ASSINATURA CORRIGIDA
 */
export const createBrasiliaTimestamp = (date?: Date | string | null): string => {
  // SEMPRE retornar UTC puro - sem conversões
  if (!date) {
    return new Date().toISOString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  
  return date.toISOString();
};

/**
 * Obter data/hora atual em Brasília - UNIVERSAL
 */
export const getCurrentBrasiliaDate = (): Date => {
  // Retornar UTC atual - conversão será feita apenas na exibição
  return new Date();
};

/**
 * Obter horário atual formatado para Brasília - UNIVERSAL
 */
export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  // Converter para Brasília apenas para exibição
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  
  const year = brasiliaTime.getUTCFullYear();
  const month = (brasiliaTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = brasiliaTime.getUTCDate().toString().padStart(2, '0');
  const hours = brasiliaTime.getUTCHours().toString().padStart(2, '0');
  const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Formatar data para inputs - UNIVERSAL
 */
export const formatDateInputToDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // Converter para Brasília apenas para exibição
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
 * Preview de período semanal - ASSINATURA CORRIGIDA
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
 * Validar range de datas Brasília - UNIVERSAL
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
 * Calcular tempo restante - ASSINATURA CORRIGIDA PARA RETORNAR NUMBER
 */
export const calculateTimeRemaining = (endDateUTC: string): number => {
  if (!endDateUTC) return 0;
  
  try {
    const now = new Date();
    const end = new Date(endDateUTC);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 0;
    
    // Retornar diferença em milissegundos
    return diff;
  } catch (error) {
    console.error('Erro ao calcular tempo restante:', error);
    return 0;
  }
};

/**
 * Calcular tempo restante formatado - NOVA FUNÇÃO PARA STRING
 */
export const calculateTimeRemainingFormatted = (endDateUTC: string): string => {
  if (!endDateUTC) return '';
  
  try {
    const now = new Date();
    const end = new Date(endDateUTC);
    const diff = end.getTime() - now.getTime();
    
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

// Funcões específicas para competições
export const getCompetitionTimeRemaining = (endDate: string): number => {
  const remaining = calculateTimeRemaining(endDate);
  return Math.max(0, Math.floor(remaining / 1000)); // Retornar em segundos
};

export const getCompetitionTimeRemainingText = (endDate: string): string => {
  return calculateTimeRemainingFormatted(endDate);
};
