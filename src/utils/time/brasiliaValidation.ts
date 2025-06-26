
/**
 * VALIDAÇÕES DE DATA E HORA
 * Funções para validar períodos, durações e ranges
 */

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
