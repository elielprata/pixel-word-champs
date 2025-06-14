
import { logger } from '@/utils/logger';

// Função para normalizar texto (remover acentos, maiúsculas)
export const normalizeText = (text: string): string => {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^A-Z]/g, ''); // Remove caracteres especiais
};

// Validar se uma palavra é adequada para o jogo
export const isValidGameWord = (word: string, maxLength: number): boolean => {
  const normalizedWord = normalizeText(word);
  
  // Critérios básicos
  if (normalizedWord.length < 3) return false;
  if (normalizedWord.length > maxLength) return false;
  if (!/^[A-Z]+$/.test(normalizedWord)) return false;
  
  return true;
};

// Palavras padrão como fallback (simplificadas)
export const getDefaultWordsForSize = (boardSize: number): string[] => {
  const allDefaultWords = [
    'CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO',
    'AGUA', 'TERRA', 'FOGO', 'VENTO', 'PEDRA',
    'FLOR', 'ARVORE', 'FOLHA', 'FRUTO', 'RAIZ',
    'SOL', 'LUA', 'ESTRELA', 'CÉU', 'NUVEM',
    'MAR', 'RIO', 'LAGO', 'PONTE', 'ESTRADA'
  ];
  
  const maxLength = Math.min(boardSize - 1, 8);
  const validWords = allDefaultWords
    .filter(word => isValidGameWord(word, maxLength))
    .slice(0, 5);
  
  logger.info('📝 Usando palavras padrão', { 
    boardSize, 
    maxLength, 
    validWords 
  }, 'LEVEL_CONFIGURATION');
  
  return validWords;
};
