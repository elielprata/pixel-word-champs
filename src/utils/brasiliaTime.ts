import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

/**
 * Configuração padrão de fuso horário para o projeto
 */
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data/hora atual no fuso horário de Brasília
 */
export const getBrasiliaTime = (): Date => {
  return toZonedTime(new Date(), BRASILIA_TIMEZONE);
};

/**
 * Converte uma data UTC para o fuso horário de Brasília
 */
export const utcToBrasilia = (utcDate: Date): Date => {
  return toZonedTime(utcDate, BRASILIA_TIMEZONE);
};

/**
 * Converte uma data do fuso horário de Brasília para UTC
 */
export const brasiliaToUtc = (brasiliaDate: Date): Date => {
  return fromZonedTime(brasiliaDate, BRASILIA_TIMEZONE);
};

/**
 * Formata uma data no fuso horário de Brasília
 */
export const formatBrasiliaTime = (date: Date, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  return format(toZonedTime(date, BRASILIA_TIMEZONE), formatString, { timeZone: BRASILIA_TIMEZONE });
};

/**
 * Cria uma data para o início do dia em Brasília (00:00:00) e retorna em UTC
 * CORRIGIDO: Garantir que a data resultante seja UTC equivalente ao horário de Brasília
 */
export const createBrasiliaStartOfDay = (date: Date): Date => {
  // Obter a data no fuso de Brasília
  const brasiliaDate = toZonedTime(date, BRASILIA_TIMEZONE);
  
  // Definir como início do dia (00:00:00)
  brasiliaDate.setHours(0, 0, 0, 0);
  
  // Converter de volta para UTC
  const utcDate = fromZonedTime(brasiliaDate, BRASILIA_TIMEZONE);
  
  console.log('🌅 Criando início do dia:', {
    original: formatBrasiliaTime(date),
    brasiliaStartOfDay: formatBrasiliaTime(brasiliaDate),
    utcEquivalent: utcDate.toISOString()
  });
  
  return utcDate;
};

/**
 * Cria uma data para o final do dia em Brasília (23:59:59.999) e retorna em UTC
 * CORRIGIDO: Garantir que a data resultante seja UTC equivalente ao horário de Brasília
 */
export const createBrasiliaEndOfDay = (date: Date): Date => {
  // Obter a data no fuso de Brasília
  const brasiliaDate = toZonedTime(date, BRASILIA_TIMEZONE);
  
  // Definir como final do dia (23:59:59.999)
  brasiliaDate.setHours(23, 59, 59, 999);
  
  // Converter de volta para UTC
  const utcDate = fromZonedTime(brasiliaDate, BRASILIA_TIMEZONE);
  
  console.log('🌆 Criando fim do dia:', {
    original: formatBrasiliaTime(date),
    brasiliaEndOfDay: formatBrasiliaTime(brasiliaDate),
    utcEquivalent: utcDate.toISOString()
  });
  
  return utcDate;
};

/**
 * NOVA FUNÇÃO: Garante que uma data termine às 23:59:59 no horário de Brasília
 */
export const ensureEndOfDay = (date: Date): Date => {
  return createBrasiliaEndOfDay(date);
};

/**
 * Verifica se uma data está no período atual de Brasília
 */
export const isDateInCurrentBrasiliaRange = (startDate: Date, endDate: Date): boolean => {
  const brasiliaStart = utcToBrasilia(startDate);
  const brasiliaEnd = utcToBrasilia(endDate);
  const brasiliaNow = getBrasiliaTime();
  
  console.log('🔍 Verificando período ativo (Brasília):', {
    start: formatBrasiliaTime(brasiliaStart),
    end: formatBrasiliaTime(brasiliaEnd),
    now: formatBrasiliaTime(brasiliaNow)
  });
  
  const isActive = brasiliaNow >= brasiliaStart && brasiliaNow <= brasiliaEnd;
  console.log('✅ Ativo:', isActive);
  
  return isActive;
};

/**
 * Verifica se uma data está no futuro (horário de Brasília)
 */
export const isBrasiliaDateInFuture = (date: Date): boolean => {
  const brasiliaNow = getBrasiliaTime();
  const brasiliaDate = utcToBrasilia(date);
  
  const isFuture = brasiliaDate > brasiliaNow;
  console.log('🔍 Verificando se data é futura:', {
    date: formatBrasiliaTime(brasiliaDate),
    now: formatBrasiliaTime(brasiliaNow),
    isFuture
  });
  
  return isFuture;
};

/**
 * Obtém a data atual de Brasília apenas (sem horário)
 */
export const getBrasiliaDateOnly = (): string => {
  return formatBrasiliaTime(new Date(), 'yyyy-MM-dd');
};

/**
 * Converte uma data ISO string para o horário de Brasília
 */
export const isoToBrasilia = (isoString: string): Date => {
  return utcToBrasilia(new Date(isoString));
};

/**
 * NOVA FUNÇÃO: Calcula o status correto de uma competição diária baseado no horário de Brasília
 * Esta é a única função que deve ser usada para competições diárias
 */
export const calculateDailyCompetitionStatus = (competitionDate: string): string => {
  const nowBrasilia = getBrasiliaTime();
  const competitionDay = new Date(competitionDate);
  
  // Criar início e fim do dia da competição em UTC (baseado no horário de Brasília)
  const dayStartUtc = createBrasiliaStartOfDay(competitionDay);
  const dayEndUtc = createBrasiliaEndOfDay(competitionDay);
  
  // Converter para horário de Brasília para comparação
  const dayStartBrasilia = utcToBrasilia(dayStartUtc);
  const dayEndBrasilia = utcToBrasilia(dayEndUtc);
  
  console.log('🔍 Calculando status da competição diária:', {
    competitionDate,
    nowBrasilia: formatBrasiliaTime(nowBrasilia),
    dayStartBrasilia: formatBrasiliaTime(dayStartBrasilia),
    dayEndBrasilia: formatBrasiliaTime(dayEndBrasilia),
    isBeforeStart: nowBrasilia < dayStartBrasilia,
    isAfterEnd: nowBrasilia > dayEndBrasilia,
    isActive: nowBrasilia >= dayStartBrasilia && nowBrasilia <= dayEndBrasilia
  });
  
  // Regras de status em horário de Brasília:
  if (nowBrasilia < dayStartBrasilia) {
    console.log('⏳ Competição diária: AGUARDANDO INÍCIO');
    return 'scheduled';
  } else if (nowBrasilia >= dayStartBrasilia && nowBrasilia <= dayEndBrasilia) {
    console.log('✅ Competição diária: ATIVA');
    return 'active';
  } else {
    console.log('🏁 Competição diária: FINALIZADA');
    return 'completed';
  }
};

/**
 * NOVA FUNÇÃO: Calcula o status correto de uma competição semanal baseado em UTC
 */
export const calculateWeeklyCompetitionStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  console.log('🔍 Calculando status da competição semanal:', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString(),
    isBeforeStart: now < start,
    isAfterEnd: now > end,
    isActive: now >= start && now <= end
  });
  
  if (now < start) {
    console.log('⏳ Competição semanal: AGUARDANDO INÍCIO');
    return 'scheduled';
  } else if (now >= start && now <= end) {
    console.log('✅ Competição semanal: ATIVA');
    return 'active';
  } else {
    console.log('🏁 Competição semanal: FINALIZADA');
    return 'completed';
  }
};
