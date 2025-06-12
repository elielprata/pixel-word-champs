
/**
 * UTILITÁRIOS DE TEMPO PARA BRASÍLIA - VERSÃO CORRIGIDA
 * 
 * Esta versão trabalha com strings simples e comparações diretas,
 * sem conversões complexas de timezone que podem causar problemas.
 */

/**
 * Obtém a data/hora atual no formato ISO, ajustada para Brasília
 */
export const getCurrentDateISO = (): string => {
  const now = new Date();
  // Ajustar para UTC-3 (Brasília)
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  const isoString = brasiliaTime.toISOString();
  
  console.log('🕐 [getCurrentDateISO] Horário atual (Brasília):', isoString);
  return isoString;
};

/**
 * Calcula o status correto de uma competição baseado nas datas
 * VERSÃO SIMPLIFICADA - usando comparação de strings
 */
export const calculateCompetitionStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  console.log('🔍 [calculateCompetitionStatus] Calculando status:', {
    startDate,
    endDate,
    nowISO: now.toISOString(),
    startISO: start.toISOString(),
    endISO: end.toISOString()
  });

  let status: string;
  
  if (now < start) {
    status = 'scheduled';
  } else if (now >= start && now <= end) {
    status = 'active';
  } else {
    status = 'completed';
  }

  console.log(`📊 [calculateCompetitionStatus] Status calculado: ${status}`);
  return status;
};

/**
 * Formata uma data para exibição no fuso de Brasília
 */
export const formatDateForBrasilia = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    const formatted = date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log('📅 [formatDateForBrasilia] Data formatada:', {
      input: dateString,
      output: formatted
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ [formatDateForBrasilia] Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Alias para formatDateForBrasilia (compatibilidade)
 */
export const formatDateForDisplay = (dateString: string): string => {
  return formatDateForBrasilia(dateString);
};

/**
 * Formata data e hora para exibição completa
 */
export const formatDateTimeForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    const formatted = date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('📅 [formatDateTimeForDisplay] Data/hora formatada:', {
      input: dateString,
      output: formatted
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ [formatDateTimeForDisplay] Erro ao formatar data/hora:', error);
    return dateString;
  }
};

/**
 * Verifica se uma data está no passado (Brasília)
 */
export const isDateInPast = (dateString: string): boolean => {
  const now = new Date();
  const date = new Date(dateString);
  const isPast = date < now;
  
  console.log('⏪ [isDateInPast] Verificação:', {
    dateString,
    now: now.toISOString(),
    date: date.toISOString(),
    isPast
  });
  
  return isPast;
};

/**
 * Verifica se uma data está no futuro (Brasília)
 */
export const isDateInFuture = (dateString: string): boolean => {
  const now = new Date();
  const date = new Date(dateString);
  const isFuture = date > now;
  
  console.log('⏩ [isDateInFuture] Verificação:', {
    dateString,
    now: now.toISOString(),
    date: date.toISOString(),
    isFuture
  });
  
  return isFuture;
};

console.log('🎯 [brasiliaTime] Utilitários de tempo carregados (versão corrigida)');
