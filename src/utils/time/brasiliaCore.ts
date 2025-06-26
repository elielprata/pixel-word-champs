/**
 * CONVERSÕES PRINCIPAIS - BRASÍLIA ↔ UTC
 * CORRIGIDO: Funções core para conversão entre fusos horários sem double conversion
 */

/**
 * CORRIGIDO: Converte input datetime-local para UTC sem double conversion
 * Input: 15:30 Brasília → Output: 18:30 UTC (exatamente +3h uma vez)
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    console.log('🔄 CONVERSÃO BRASÍLIA → UTC (CORRIGIDA):', {
      input: brasiliaDateTime,
      step: 'Conversão direta sem double-conversion'
    });
    
    // CORREÇÃO: O datetime-local é interpretado como horário local
    // Precisamos tratá-lo como Brasília e converter para UTC
    const [datePart, timePart] = brasiliaDateTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    // Criar data em Brasília (UTC-3)
    const brasiliaDate = new Date();
    brasiliaDate.setFullYear(year, month - 1, day);
    brasiliaDate.setHours(hour, minute, 0, 0);
    
    // Adicionar offset do Brasil (+3 horas para converter para UTC)
    const utcTime = brasiliaDate.getTime() + (3 * 60 * 60 * 1000);
    const utcResult = new Date(utcTime).toISOString();
    
    console.log('✅ Conversão corrigida:', {
      brasiliaInput: brasiliaDateTime,
      brasiliaTime: brasiliaDate.toLocaleString('pt-BR'),
      utcResult: utcResult,
      operation: 'Adicionou +3h para converter Brasília→UTC'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao converter Brasília para UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * CORRIGIDO: Converte UTC para formato datetime-local (Brasília)
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    console.log('🔄 UTC → Brasília (CORRIGIDO):', {
      input: utcDateTime,
      step: 'Conversão usando offset manual'
    });
    
    const utcDate = new Date(utcDateTime);
    
    // Subtrair 3 horas para converter UTC para Brasília
    const brasiliaTime = utcDate.getTime() - (3 * 60 * 60 * 1000);
    const brasiliaDate = new Date(brasiliaTime);
    
    // Formatar para datetime-local
    const year = brasiliaDate.getFullYear();
    const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
    const day = String(brasiliaDate.getDate()).padStart(2, '0');
    const hours = String(brasiliaDate.getHours()).padStart(2, '0');
    const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
    
    const result = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    console.log('✅ UTC → Brasília (corrigido):', {
      utcInput: utcDateTime,
      brasiliaResult: result,
      operation: 'Subtraiu -3h para converter UTC→Brasília'
    });
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao converter UTC para datetime-local:', error);
    return '';
  }
};

export const createBrasiliaTimestamp = (date?: Date | string | null): string => {
  if (!date) {
    return new Date().toISOString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  
  return date.toISOString();
};

export const getCurrentBrasiliaDate = (): Date => {
  return new Date();
};

export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  
  try {
    const brasiliaTime = now.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const cleanedTime = brasiliaTime.replace(/,\s*/g, ' ').trim();
    
    console.log('🕐 FORMATAÇÃO getCurrentBrasiliaTime:', {
      original: brasiliaTime,
      cleaned: cleanedTime,
      regex: /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(cleanedTime)
    });
    
    return cleanedTime;
  } catch (error) {
    console.error('❌ Erro ao formatar horário atual:', error);
    const fallback = now.toISOString().replace('T', ' ').slice(0, 19);
    return fallback;
  }
};
