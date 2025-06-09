
/**
 * Utilitários para trabalhar com horário de Brasília (UTC-3)
 */

export const getBrasiliaTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
};

export const formatToBrasiliaString = (date: Date): string => {
  return date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
};

export const isBrasiliaDateInPast = (date: Date): boolean => {
  const brasiliaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaNow = getBrasiliaTime();
  return brasiliaDate < brasiliaNow;
};

export const isBrasiliaDateInFuture = (date: Date): boolean => {
  const brasiliaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaNow = getBrasiliaTime();
  return brasiliaDate > brasiliaNow;
};

export const isDateInCurrentBrasiliaRange = (startDate: Date, endDate: Date): boolean => {
  const brasiliaStart = new Date(startDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaEnd = new Date(endDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaNow = getBrasiliaTime();
  
  return brasiliaNow >= brasiliaStart && brasiliaNow <= brasiliaEnd;
};
