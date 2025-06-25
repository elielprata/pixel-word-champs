
import { useState, useEffect, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGameScoring } from '@/hooks/useGameScoring';
import { useGamePointsConfig } from '@/hooks/useGamePointsConfig';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { GAME_CONSTANTS } from '@/constants/game';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameState {
  foundWords: FoundWord[];
  hintsUsed: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
  isLevelCompleted: boolean;
}

export const useGameState = (
  levelWords: string[],
  timeLeft?: number,
  onLevelComplete?: (levelScore: number) => void,
  boardData?: { board: string[][]; placedWords: any[] }
) => {
  const [state, setState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    showGameOver: false,
    showLevelComplete: false,
    hintHighlightedCells: [],
    permanentlyMarkedCells: [],
    isLevelCompleted: false
  });

  const { getPointsForWord } = useGamePointsConfig();

  // Usar hook especializado de pontuação
  const { 
    currentLevelScore, 
    isLevelCompleted, 
    updateUserScore 
  } = useGameScoring(state.foundWords, 1); // level default 1

  // Reset state quando muda as palavras do nível
  useEffect(() => {
    logger.info(`🔄 Resetando estado do jogo`, { wordCount: levelWords.length }, 'GAME_STATE');
    setState({
      foundWords: [],
      hintsUsed: 0,
      showGameOver: false,
      showLevelComplete: false,
      hintHighlightedCells: [],
      permanentlyMarkedCells: [],
      isLevelCompleted: false
    });
  }, [levelWords]);

  // Game Over quando tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver && !state.isLevelCompleted) {
      logger.info('⏰ Tempo esgotado - Game Over', { 
        foundWords: state.foundWords.length,
        targetWords: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED 
      }, 'GAME_STATE');
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver, state.isLevelCompleted, state.foundWords.length]);

  // Level complete quando atinge o número necessário de palavras
  useEffect(() => {
    if (isLevelCompleted && !state.showLevelComplete && !state.isLevelCompleted) {
      logger.info(`🎉 Nível COMPLETADO!`, {
        foundWordsCount: state.foundWords.length,
        totalWordsRequired: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED,
        foundWords: state.foundWords.map(fw => fw.word),
        levelScore: currentLevelScore
      }, 'GAME_STATE');
      
      setState(prev => ({ 
        ...prev, 
        showLevelComplete: true, 
        isLevelCompleted: true 
      }));
      
      // Notificar level complete via callback
      if (onLevelComplete) {
        logger.info(`📞 CALLBACK - Notificando level complete: ${currentLevelScore} pontos`, {
          score: currentLevelScore
        }, 'GAME_STATE');
        onLevelComplete(currentLevelScore);
      }
      
      // Registrar pontos no banco
      updateUserScore(currentLevelScore);
    }
  }, [isLevelCompleted, state.showLevelComplete, state.isLevelCompleted, state.foundWords, currentLevelScore, updateUserScore, onLevelComplete]);

  // Função para obter a palavra extra (com maior pontuação)
  const getExtraWord = useCallback((): string | null => {
    if (!levelWords || levelWords.length === 0) return null;
    
    const wordsWithPoints = levelWords.map(word => ({
      word,
      points: getPointsForWord(word)
    }));
    const sorted = [...wordsWithPoints].sort((a, b) => b.points - a.points);
    return sorted[0]?.word || null;
  }, [levelWords, getPointsForWord]);

  // Sistema de dicas CORRIGIDO e unificado
  const useHint = useCallback(() => {
    logger.info('💡 Dica solicitada', { 
      hintsUsed: state.hintsUsed, 
      hasBoard: !!boardData,
      levelWordsCount: levelWords.length 
    }, 'GAME_STATE');

    // Verificar se já usou a dica
    if (state.hintsUsed >= 1) {
      toast({
        title: "Dica indisponível",
        description: "Você já usou sua dica neste nível.",
        variant: "destructive"
      });
      logger.warn('Dica bloqueada - já foi usada', { hintsUsed: state.hintsUsed }, 'GAME_STATE');
      return;
    }

    // Verificar se temos dados do tabuleiro
    if (!boardData || !boardData.placedWords) {
      toast({
        title: "Dica indisponível",
        description: "Dados do tabuleiro não disponíveis.",
        variant: "destructive"
      });
      logger.error('Dica bloqueada - sem dados do tabuleiro', { hasBoard: !!boardData }, 'GAME_STATE');
      return;
    }

    const extraWord = getExtraWord();
    logger.info('🎯 Palavra extra identificada', { extraWord }, 'GAME_STATE');

    // Encontrar primeira palavra não encontrada que NÃO é a extra
    const hintWord = levelWords.find(
      (word) =>
        !state.foundWords.some(fw => fw.word === word) &&
        word !== extraWord
    );

    if (!hintWord) {
      toast({
        title: "Dica indisponível",
        description: "A dica não pode ser usada na palavra de Desafio Extra. Tente encontrá-la por conta própria!",
        variant: "destructive"
      });
      logger.warn('Dica bloqueada - apenas palavra extra disponível', { 
        extraWord, 
        foundWords: state.foundWords.map(fw => fw.word) 
      }, 'GAME_STATE');
      return;
    }

    // Encontrar posicionamento da palavra no tabuleiro
    const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);

    if (!wordPlacement || !Array.isArray(wordPlacement.positions)) {
      toast({
        title: "Dica não pôde ser aplicada",
        description: "Não foi possível encontrar a posição da palavra no tabuleiro.",
        variant: "destructive"
      });
      logger.error('Dica bloqueada - palavra não encontrada no tabuleiro', { 
        hintWord, 
        hasPlacement: !!wordPlacement,
        hasPositions: wordPlacement?.positions ? Array.isArray(wordPlacement.positions) : false
      }, 'GAME_STATE');
      return;
    }

    // Aplicar a dica
    setState(prev => ({ 
      ...prev, 
      hintsUsed: prev.hintsUsed + 1,
      hintHighlightedCells: wordPlacement.positions
    }));

    logger.info('✅ Dica aplicada com sucesso', { 
      word: hintWord, 
      hintsUsed: state.hintsUsed + 1,
      positionsCount: wordPlacement.positions.length
    }, 'GAME_STATE');

    toast({
      title: "Dica revelada!",
      description: `Palavra destacada: ${hintWord}`,
      variant: "default"
    });

    // Remover destaque após 3 segundos
    setTimeout(() => {
      setState(prev => ({ ...prev, hintHighlightedCells: [] }));
      logger.info('🔄 Destaque da dica removido', { word: hintWord }, 'GAME_STATE');
    }, 3000);

  }, [state.hintsUsed, state.foundWords, levelWords, boardData, getExtraWord]);

  const addFoundWord = useCallback((newFoundWord: FoundWord) => {
    // PROTEÇÃO FINAL: Verificar duplicação uma última vez antes de adicionar ao estado
    const isAlreadyFound = state.foundWords.some(fw => fw.word === newFoundWord.word);
    if (isAlreadyFound) {
      logger.error(`🚨 DUPLICAÇÃO EVITADA NO ESTADO FINAL - Palavra "${newFoundWord.word}" já existe`, {
        word: newFoundWord.word,
        existingWords: state.foundWords.map(fw => fw.word),
        attemptedWord: newFoundWord
      }, 'GAME_STATE');
      return;
    }

    logger.info(`📝 ADICIONANDO PALAVRA AO ESTADO - "${newFoundWord.word}" = ${newFoundWord.points} pontos`, {
      word: newFoundWord.word,
      points: newFoundWord.points,
      beforeCount: state.foundWords.length,
      afterCount: state.foundWords.length + 1,
      allWordsAfter: [...state.foundWords.map(fw => fw.word), newFoundWord.word]
    }, 'GAME_STATE');
    
    setState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, newFoundWord],
      permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
    }));
  }, [state.foundWords]);

  return {
    ...state,
    currentLevelScore,
    addFoundWord,
    useHint,
    setHintsUsed: (value: number | ((prev: number) => number)) => {
      setState(prev => ({ 
        ...prev, 
        hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value 
      }));
    },
    setHintHighlightedCells: (positions: Position[]) => {
      setState(prev => ({ ...prev, hintHighlightedCells: positions }));
    },
    setShowGameOver: (value: boolean) => {
      setState(prev => ({ ...prev, showGameOver: value }));
    },
    setShowLevelComplete: (value: boolean) => {
      setState(prev => ({ ...prev, showLevelComplete: value }));
    },
    setIsLevelCompleted: (value: boolean) => {
      setState(prev => ({ ...prev, isLevelCompleted: value }));
    }
  };
};
