
import { useCallback, useState } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface UseUnifiedHintSystemProps {
  levelWords: string[];
  foundWords: FoundWord[];
  boardData: { board: string[][]; placedWords: any[] };
  hintsUsed: number;
  setHintsUsed: (value: number | ((prev: number) => number)) => void;
  setHintHighlightedCells: (positions: Position[]) => void;
}

export const useUnifiedHintSystem = ({
  levelWords,
  foundWords,
  boardData,
  hintsUsed,
  setHintsUsed,
  setHintHighlightedCells
}: UseUnifiedHintSystemProps) => {
  const { getPointsForWord } = useGamePointsConfig();
  const [showHintBlockedModal, setShowHintBlockedModal] = useState(false);

  // Identificar a palavra "extra" (maior pontuação) que não pode receber dica
  const getExtraWord = useCallback((): string | null => {
    if (levelWords.length === 0) return null;
    
    const wordsWithPoints = levelWords.map(word => ({
      word,
      points: getPointsForWord(word)
    }));
    
    const sorted = [...wordsWithPoints].sort((a, b) => b.points - a.points);
    return sorted[0]?.word || null;
  }, [levelWords, getPointsForWord]);

  // Função principal para usar dica
  const useHint = useCallback(() => {
    // Validação 1: Verificar se ainda há dicas disponíveis
    if (hintsUsed >= 1) {
      logger.warn('Tentativa de usar dica quando não há mais disponíveis', {
        hintsUsed,
        maxHints: 1
      }, 'UNIFIED_HINT_SYSTEM');
      return false;
    }

    const extraWord = getExtraWord();
    const foundWordTexts = foundWords.map(fw => fw.word);
    
    // Encontrar palavras disponíveis para dica (não encontradas + não é palavra extra)
    const availableWordsForHint = levelWords.filter(word => 
      !foundWordTexts.includes(word) && word !== extraWord
    );

    // Validação 2: Verificar se há palavras disponíveis para dica
    if (availableWordsForHint.length === 0) {
      logger.info('Nenhuma palavra disponível para dica (só resta palavra extra)', {
        extraWord,
        totalWords: levelWords.length,
        foundWords: foundWords.length
      }, 'UNIFIED_HINT_SYSTEM');
      
      setShowHintBlockedModal(true);
      return false;
    }

    // Escolher a palavra mais fácil (menor pontuação/tamanho)
    const sortedAvailableWords = availableWordsForHint.sort((a, b) => {
      const pointsA = getPointsForWord(a);
      const pointsB = getPointsForWord(b);
      
      // Priorizar por menor pontuação, depois por menor tamanho
      if (pointsA !== pointsB) return pointsA - pointsB;
      return a.length - b.length;
    });

    const hintWord = sortedAvailableWords[0];

    // Encontrar posições da palavra no tabuleiro
    const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);
    
    if (!wordPlacement || !Array.isArray(wordPlacement.positions)) {
      logger.error('Palavra para dica não encontrada no tabuleiro', {
        hintWord,
        availablePlacements: boardData.placedWords.map(pw => pw.word)
      }, 'UNIFIED_HINT_SYSTEM');
      return false;
    }

    // Aplicar dica com sucesso
    setHintsUsed(prev => prev + 1);
    setHintHighlightedCells(wordPlacement.positions);
    
    logger.info('Dica aplicada com sucesso', {
      hintWord,
      positions: wordPlacement.positions,
      hintsUsedAfter: hintsUsed + 1,
      extraWord,
      availableWordsCount: availableWordsForHint.length
    }, 'UNIFIED_HINT_SYSTEM');

    // Remover destaque após 3 segundos
    setTimeout(() => {
      setHintHighlightedCells([]);
    }, 3000);

    return true;
  }, [
    hintsUsed,
    getExtraWord,
    foundWords,
    levelWords,
    boardData.placedWords,
    setHintsUsed,
    setHintHighlightedCells,
    getPointsForWord
  ]);

  // Função para fechar o modal de dica bloqueada
  const closeHintBlockedModal = useCallback(() => {
    setShowHintBlockedModal(false);
  }, []);

  return {
    useHint,
    showHintBlockedModal,
    closeHintBlockedModal,
    getExtraWord: getExtraWord()
  };
};
