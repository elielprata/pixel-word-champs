
/**
 * CONVERSÕES PRINCIPAIS - BRASÍLIA ↔ UTC
 * Funções core para conversão entre fusos horários
 */

/**
 * CORRIGIDO: Converte input datetime-local para UTC sem duplicação
 * Input: 15:30 Brasília → Output: 18:30 UTC (correto: +3h apenas uma vez)
 */
export const convertBrasiliaInputToUTC = (brasiliaDateTime: string): string => {
  if (!brasiliaDateTime) return new Date().toISOString();
  
  try {
    console.log('🔄 CONVERSÃO BRASÍLIA → UTC (SEM DUPLICAÇÃO):', {
      input: brasiliaDateTime,
      step: 'Conversão direta sem adições extras'
    });
    
    // CORREÇÃO DEFINITIVA: Usar Date diretamente sem parsing manual
    // O datetime-local já é interpretado no timezone local do sistema
    const brasiliaDate = new Date(brasiliaDateTime);
    
    // Verificar se a data é válida
    if (isNaN(brasiliaDate.getTime())) {
      console.error('❌ Data inválida:', brasiliaDateTime);
      return new Date().toISOString();
    }
    
    // A conversão para UTC é automática pelo toISOString()
    const utcResult = brasiliaDate.toISOString();
    
    console.log('✅ Conversão sem duplicação:', {
      brasiliaInput: brasiliaDateTime,
      brasiliaTime: brasiliaDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      utcResult: utcResult,
      operation: 'Conversão direta sem adições manuais'
    });
    
    return utcResult;
  } catch (error) {
    console.error('❌ Erro ao converter Brasília para UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * CORRIGIDO: Converte UTC para formato datetime-local (Brasília) sem duplicação
 */
export const formatUTCForDateTimeLocal = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    console.log('🔄 UTC → Brasília (SEM DUPLICAÇÃO):', {
      input: utcDateTime,
      step: 'Conversão usando toLocaleString'
    });
    
    const utcDate = new Date(utcDateTime);
    
    // CORREÇÃO: Usar toLocaleString para conversão automática
    const brasiliaString = utcDate.toLocaleString('sv-SE', { 
      timeZone: 'America/Sao_Paulo' 
    }).replace(' ', 'T').slice(0, 16);
    
    console.log('✅ UTC → Brasília (sem duplicação):', {
      utcInput: utcDateTime,
      brasiliaResult: brasiliaString,
      operation: 'Conversão automática via toLocaleString'
    });
    
    return brasiliaString;
  } catch (error) {
    console.error('❌ Erro ao converter UTC para datetime-local:', error);
    return '';
  }
};

/**
 * Criar timestamp UTC para banco de dados
 */
export const createBrasiliaTimestamp = (date?: Date | string | null): string => {
  if (!date) {
    return new Date().toISOString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  
  return date.toISOString();
};

/**
 * Obter data/hora atual em Brasília
 */
export const getCurrentBrasiliaDate = (): Date => {
  return new Date();
};

/**
 * Obter horário atual formatado para Brasília
 */
export const getCurrentBrasiliaTime = (): string => {
  const now = new Date();
  return now.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo' 
  });
};
