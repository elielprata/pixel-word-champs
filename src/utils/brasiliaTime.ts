
/**
 * Utilitários para trabalhar com horário de Brasília (UTC-3)
 */

export const getBrasiliaTime = (): Date => {
  // Criar uma nova data e ajustar para UTC-3 (Brasília)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaOffset = -3; // UTC-3
  const brasiliaTime = new Date(utc + (brasiliaOffset * 3600000));
  
  console.log('🕐 Horário UTC:', now.toISOString());
  console.log('🇧🇷 Horário Brasília calculado:', brasiliaTime.toISOString());
  
  return brasiliaTime;
};

export const isDateInCurrentBrasiliaRange = (startDate: Date, endDate: Date): boolean => {
  const brasiliaStart = new Date(startDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaEnd = new Date(endDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaNow = getBrasiliaTime();
  
  console.log('🔍 Verificando período ativo:');
  console.log('  📅 Início:', brasiliaStart.toISOString());
  console.log('  📅 Fim:', brasiliaEnd.toISOString());
  console.log('  🕐 Agora:', brasiliaNow.toISOString());
  
  const isActive = brasiliaNow >= brasiliaStart && brasiliaNow <= brasiliaEnd;
  console.log('  ✅ Ativo:', isActive);
  
  return isActive;
};

export const isBrasiliaDateInFuture = (date: Date): boolean => {
  const brasiliaNow = getBrasiliaTime();
  const brasiliaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  console.log('🔍 Verificando se data é futura:');
  console.log('  📅 Data:', brasiliaDate.toISOString());
  console.log('  🕐 Agora:', brasiliaNow.toISOString());
  
  const isFuture = brasiliaDate > brasiliaNow;
  console.log('  ➡️ É futura:', isFuture);
  
  return isFuture;
};
