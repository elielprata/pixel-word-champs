
/**
 * Utilitários para trabalhar com horário de Brasília (UTC-3)
 */

export const getBrasiliaTime = (): Date => {
  // Usar a API nativa de fuso horário para obter o horário de Brasília
  const brasiliaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  console.log('🕐 Horário UTC:', new Date().toISOString());
  console.log('🇧🇷 Horário Brasília calculado:', brasiliaTime.toISOString());
  
  return brasiliaTime;
};

export const isDateInCurrentBrasiliaRange = (startDate: Date, endDate: Date): boolean => {
  const brasiliaNow = getBrasiliaTime();
  
  // Converter as datas para o fuso horário de Brasília
  const brasiliaStart = new Date(startDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const brasiliaEnd = new Date(endDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  console.log('🔍 Verificando período ativo:');
  console.log('  📅 Início (Brasília):', brasiliaStart.toISOString());
  console.log('  📅 Fim (Brasília):', brasiliaEnd.toISOString());
  console.log('  🕐 Agora (Brasília):', brasiliaNow.toISOString());
  
  const isActive = brasiliaNow >= brasiliaStart && brasiliaNow <= brasiliaEnd;
  console.log('  ✅ Ativo:', isActive);
  
  return isActive;
};

export const isBrasiliaDateInFuture = (date: Date): boolean => {
  const brasiliaNow = getBrasiliaTime();
  const brasiliaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  console.log('🔍 Verificando se data é futura:');
  console.log('  📅 Data (Brasília):', brasiliaDate.toISOString());
  console.log('  🕐 Agora (Brasília):', brasiliaNow.toISOString());
  
  const isFuture = brasiliaDate > brasiliaNow;
  console.log('  ➡️ É futura:', isFuture);
  
  return isFuture;
};

// Nova função para verificar se uma competição está ativa considerando Brasília
export const isCompetitionActiveInBrasilia = (startDate: Date, endDate: Date): boolean => {
  const brasiliaNow = getBrasiliaTime();
  
  console.log('🔍 Verificando competição no horário de Brasília:');
  console.log('  📅 Início UTC:', startDate.toISOString());
  console.log('  📅 Fim UTC:', endDate.toISOString());
  console.log('  🕐 Agora Brasília:', brasiliaNow.toISOString());
  
  // Para competições diárias, verificar se estamos no mesmo dia em Brasília
  const startDateBrasilia = new Date(startDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const endDateBrasilia = new Date(endDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  console.log('  📅 Início Brasília:', startDateBrasilia.toISOString());
  console.log('  📅 Fim Brasília:', endDateBrasilia.toISOString());
  
  const isActive = brasiliaNow >= startDateBrasilia && brasiliaNow <= endDateBrasilia;
  console.log('  ✅ Ativo:', isActive);
  
  return isActive;
};
