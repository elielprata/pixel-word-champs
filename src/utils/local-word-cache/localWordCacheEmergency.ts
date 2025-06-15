
import { logger } from '../logger';

export const localWordCacheEmergency = {
  getEmergencyFallback(count: number = 5): string[] {
    const emergencyWords = [
      // Palavras básicas 4-5 letras
      'CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'PESSOA', 'LUGAR', 'FORMA',
      'PARTE', 'GRUPO', 'ESTADO', 'CIDADE', 'PAIS', 'ANOS', 'CASO', 'TIPO',
      'MODO', 'MEIO', 'AGUA', 'TERRA', 'FOGO', 'VENTO',
      
      // Palavras médias 6-7 letras
      'SISTEMA', 'GOVERNO', 'EMPRESA', 'TRABALHO', 'MOMENTO', 'PRODUTO',
      'SERVIÇO', 'PROJETO', 'PROGRAMA', 'HISTORIA', 'FAMILIA', 'CULTURA',
      'NATUREZA', 'ENERGIA', 'CIENCIA', 'MUSICA',
      
      // Palavras complexas 8+ letras
      'PROBLEMA', 'PROCESSO', 'EDUCACAO', 'MEDICINA', 'ENGENHARIA', 'FILOSOFIA',
      'PSICOLOGIA', 'LITERATURA', 'MATEMATICA', 'TECNOLOGIA'
    ];
    
    const shuffled = [...emergencyWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    logger.warn('🆘 Usando fallback de emergência otimizado', { 
      available: emergencyWords.length,
      selected: selected.length 
    }, 'LOCAL_CACHE');
    
    return selected;
  }
};
