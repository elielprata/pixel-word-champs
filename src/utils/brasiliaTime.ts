
/**
 * UTILITÁRIOS DE TEMPO PARA BRASÍLIA (VERSÃO CORRIGIDA)
 * 
 * IMPORTANTE: O banco de dados agora armazena as datas em UTC equivalente ao horário de Brasília
 * Isso significa que as comparações podem ser feitas diretamente sem conversões complexas
 */

/**
 * Obtém a data atual no formato ISO
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Calcula o status correto de uma competição baseado nas datas
 * CORRIGIDO: Como o banco agora armazena UTC equivalente ao Brasília, 
 * podemos comparar diretamente com o horário atual
 */
export const calculateCompetitionStatus = (
  startDate: string, 
  endDate: string
): 'scheduled' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  console.log('🔍 [calculateCompetitionStatus] Calculando status:', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString(),
    nowTime: now.getTime(),
    startTime: start.getTime(),
    endTime: end.getTime()
  });

  if (now < start) {
    console.log('📅 Status: scheduled (antes do início)');
    return 'scheduled';
  } else if (now >= start && now <= end) {
    console.log('🟢 Status: active (em andamento)');
    return 'active';
  } else {
    console.log('🔴 Status: completed (finalizada)');
    return 'completed';
  }
};

/**
 * Formata uma data para exibição (VERSÃO SIMPLIFICADA)
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo' // Garantir que seja exibido no horário de Brasília
  });
};

/**
 * Verifica se uma data está no horário de Brasília
 */
export const isInBrasiliaTimezone = (dateString: string): boolean => {
  const date = new Date(dateString);
  const brasiliaOffset = -3; // UTC-3
  const dateOffset = -date.getTimezoneOffset() / 60;
  
  console.log('🌎 [isInBrasiliaTimezone] Verificação:', {
    dateString,
    brasiliaOffset,
    dateOffset,
    match: dateOffset === brasiliaOffset
  });
  
  return dateOffset === brasiliaOffset;
};

/**
 * Calcula tempo restante em segundos
 */
export const calculateTimeRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  console.log('⏱️ [calculateTimeRemaining] Tempo restante:', {
    endDate,
    now: now.toISOString(),
    end: end.toISOString(),
    diffMs,
    remainingSeconds
  });
  
  return remainingSeconds;
};

console.log('🕒 UTILITÁRIOS DE TEMPO DE BRASÍLIA CORRIGIDOS CARREGADOS');
