
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

/**
 * Configuração padrão de fuso horário para o projeto
 */
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data/hora atual no fuso horário de Brasília (convertida para UTC)
 */
export const getBrasiliaTime = (): Date => {
  const now = new Date();
  
  console.log('🕐 Horário UTC atual do sistema:', now.toISOString());
  
  // Retornar o horário atual sem conversão, pois o banco já armazena em UTC
  // e queremos comparar com os timestamps UTC do banco
  return now;
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
 * Obtém o horário atual em UTC baseado no horário de Brasília
 */
export const getCurrentUtcFromBrasilia = (): Date => {
  const now = new Date();
  const brasiliaTime = toZonedTime(now, BRASILIA_TIMEZONE);
  const utcTime = fromZonedTime(brasiliaTime, BRASILIA_TIMEZONE);
  
  console.log('🔄 Debug conversão:', {
    original: now.toISOString(),
    brasilia: brasiliaTime.toISOString(),
    backToUtc: utcTime.toISOString()
  });
  
  return utcTime;
};

/**
 * Formata uma data no fuso horário de Brasília
 */
export const formatBrasiliaTime = (date: Date, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  return format(toZonedTime(date, BRASILIA_TIMEZONE), formatString, { timeZone: BRASILIA_TIMEZONE });
};

/**
 * Verifica se uma data está no período atual de Brasília
 */
export const isDateInCurrentBrasiliaRange = (startDate: Date, endDate: Date): boolean => {
  const brasiliaStart = utcToBrasilia(startDate);
  const brasiliaEnd = utcToBrasilia(endDate);
  const brasiliaNow = utcToBrasilia(new Date());
  
  console.log('🔍 Verificando período ativo (Brasília):');
  console.log('  📅 Início:', formatBrasiliaTime(brasiliaStart));
  console.log('  📅 Fim:', formatBrasiliaTime(brasiliaEnd));
  console.log('  🕐 Agora:', formatBrasiliaTime(brasiliaNow));
  
  const isActive = brasiliaNow >= brasiliaStart && brasiliaNow <= brasiliaEnd;
  console.log('  ✅ Ativo:', isActive);
  
  return isActive;
};

/**
 * Verifica se uma data está no futuro (horário de Brasília)
 */
export const isBrasiliaDateInFuture = (date: Date): boolean => {
  const brasiliaNow = utcToBrasilia(new Date());
  const brasiliaDate = utcToBrasilia(date);
  
  console.log('🔍 Verificando se data é futura (Brasília):');
  console.log('  📅 Data:', formatBrasiliaTime(brasiliaDate));
  console.log('  🕐 Agora:', formatBrasiliaTime(brasiliaNow));
  
  const isFuture = brasiliaDate > brasiliaNow;
  console.log('  ➡️ É futura:', isFuture);
  
  return isFuture;
};

/**
 * Cria uma data para o início do dia em Brasília (00:00:00)
 */
export const createBrasiliaStartOfDay = (date: Date): Date => {
  const brasiliaDate = utcToBrasilia(date);
  brasiliaDate.setHours(0, 0, 0, 0);
  return brasiliaToUtc(brasiliaDate);
};

/**
 * Cria uma data para o final do dia em Brasília (23:59:59.999)
 */
export const createBrasiliaEndOfDay = (date: Date): Date => {
  const brasiliaDate = utcToBrasilia(date);
  brasiliaDate.setHours(23, 59, 59, 999);
  return brasiliaToUtc(brasiliaDate);
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
