
/**
 * VERSÃO RADICAL SIMPLIFICADA - SEM CONVERSÕES DE TIMEZONE
 * 
 * Esta versão elimina TODAS as conversões de timezone no JavaScript.
 * O banco de dados (via triggers) é responsável por ajustar os horários para Brasília.
 * 
 * PRINCÍPIO: 
 * - JavaScript trabalha com datas simples (sem conversões)
 * - Trigger do banco ajusta automaticamente para horário de Brasília
 * - Zero conflitos, zero shifts de data
 */

/**
 * Cria uma data para o início do dia (00:00:00) - SEM conversão de timezone
 * SIMPLIFICADO: apenas define horário local, banco ajusta timezone
 */
export const createSimpleStartOfDay = (date: Date): Date => {
  const simpleDate = new Date(date);
  simpleDate.setHours(0, 0, 0, 0);
  
  console.log('🌅 Criando início do dia (SIMPLES):', {
    input: date.toISOString(),
    output: simpleDate.toISOString(),
    outputLocal: simpleDate.toLocaleDateString('pt-BR')
  });
  
  return simpleDate;
};

/**
 * Cria uma data para o final do dia (23:59:59) - SEM conversão de timezone
 * SIMPLIFICADO: apenas define horário local, banco ajusta timezone
 */
export const createSimpleEndOfDay = (date: Date): Date => {
  const simpleDate = new Date(date);
  simpleDate.setHours(23, 59, 59, 999);
  
  console.log('🌆 Criando fim do dia (SIMPLES):', {
    input: date.toISOString(),
    output: simpleDate.toISOString(),
    outputLocal: simpleDate.toLocaleDateString('pt-BR')
  });
  
  return simpleDate;
};

/**
 * Formata uma data para exibição em português brasileiro
 * SIMPLES: apenas formatação, sem conversões de timezone
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata uma data com horário para exibição
 * SIMPLES: apenas formatação, sem conversões de timezone
 */
export const formatDateTimeForDisplay = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtém a data atual como string ISO simples
 * SIMPLES: sem conversões de timezone
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Verifica se uma data é futura
 * SIMPLES: comparação direta de timestamps
 */
export const isDateInFuture = (date: Date): boolean => {
  const now = new Date();
  const isFuture = date > now;
  
  console.log('🔍 Verificando se data é futura (SIMPLES):', {
    date: date.toISOString(),
    now: now.toISOString(),
    isFuture
  });
  
  return isFuture;
};

/**
 * Calcula status de competição baseado em datas simples
 * SIMPLES: sem conversões de timezone, comparação direta
 */
export const calculateCompetitionStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  console.log('🔍 Calculando status da competição (SIMPLES):', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString()
  });
  
  if (now < start) {
    console.log('⏳ Status: AGENDADA');
    return 'scheduled';
  } else if (now >= start && now <= end) {
    console.log('✅ Status: ATIVA');
    return 'active';
  } else {
    console.log('🏁 Status: FINALIZADA');
    return 'completed';
  }
};

// REMOÇÃO COMPLETA das funções complexas que causavam problemas:
// - getBrasiliaTime()
// - utcToBrasilia()
// - brasiliaToUtc()
// - formatBrasiliaTime()
// - createBrasiliaStartOfDay()
// - createBrasiliaEndOfDay()
// - ensureEndOfDay()
// - isDateInCurrentBrasiliaRange()
// - isBrasiliaDateInFuture()
// - getBrasiliaDateOnly()
// - isoToBrasilia()
// - calculateDailyCompetitionStatus()
// - calculateWeeklyCompetitionStatus()

console.log('🎯 SISTEMA DE TIMEZONE RADICAL SIMPLIFICADO ATIVADO');
console.log('✅ Todas as conversões complexas de timezone foram removidas');
console.log('✅ O banco de dados agora é a única fonte de verdade para horários');
console.log('✅ Zero conflitos, zero shifts de data');
