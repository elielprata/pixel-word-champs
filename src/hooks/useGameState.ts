
import { useState, useEffect, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from '@/hooks/useGamePointsConfig';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameState {
  foundWords: FoundWord[];
  hintsUsed: number;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
}

export const useGameState = (
  levelWords: string[],
  boardData?: { board: string[][]; placedWords: any[] }
) => {
  const [state, setState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    hintHighlightedCells: [],
    permanentlyMarkedCells: []
  });

  const { getPointsForWord } = useGamePointsConfig();

  // Reset state quando muda as palavras do nível
  useEffect(() => {
    logger.info(`🔄 Resetando estado do jogo`, { wordCount: levelWords.length }, 'GAME_STATE');
    setState({
      foundWords: [],
      hintsUsed: 0,
      hintHighlightedCells: [],
      permanentlyMarkedCells: []
    });
  }, [levelWords]);

  // Sistema de dicas - permite dica para qualquer palavra
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

    // Encontrar primeira palavra não encontrada (qualquer uma)
    const hintWord = levelWords.find(
      (word) => !state.foundWords.some(fw => fw.word === word)
    );

    if (!hintWord) {
      toast({
        title: "Dica indisponível",
        description: "Todas as palavras já foram encontradas!",
        variant: "destructive"
      });
      logger.warn('Dica bloqueada - todas as palavras encontradas', { 
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

    // Remover destaque após 3 segundos
    setTimeout(() => {
      setState(prev => ({ ...prev, hintHighlightedCells: [] }));
      logger.info('🔄 Destaque da dica removido', { word: hintWord }, 'GAME_STATE');
    }, 3000);

  }, [state.hintsUsed, state.foundWords, levelWords, boardData]);

  const addFoundWord = useCallback((newFoundWord: FoundWord) => {
    // PROTEÇÃO CRÍTICA DUPLA: Verificar duplicação uma última vez antes de adicionar ao estado
    const isAlreadyFound = state.foundWords.some(fw => fw.word === newFoundWord.word);
    if (isAlreadyFound) {
      logger.error(`🚨 DUPLICAÇÃO CRÍTICA EVITADA NO ESTADO FINAL - Palavra "${newFoundWord.word}" já existe`, {
        word: newFoundWord.word,
        points: newFoundWord.points,
        existingWords: state.foundWords.map(fw => fw.word),
        attemptedWord: newFoundWord,
        totalWordsBeforeAttempt: state.foundWords.length
      }, 'GAME_STATE');
      return;
    }

    // PROTEÇÃO ADICIONAL: Verificar se os pontos são válidos
    if (newFoundWord.points <= 0) {
      logger.error(`🚨 PONTUAÇÃO INVÁLIDA - Palavra "${newFoundWord.word}" com ${newFoundWord.points} pontos`, {
        word: newFoundWord.word,
        points: newFoundWord.points
      }, 'GAME_STATE');
      return;
    }

    logger.info(`📝 ADICIONANDO PALAVRA AO ESTADO (PROTEÇÃO DUPLA OK) - "${newFoundWord.word}" = ${newFoundWord.points} pontos`, {
      word: newFoundWord.word,
      points: newFoundWord.points,
      beforeCount: state.foundWords.length,
      afterCount: state.foundWords.length + 1,
      allWordsAfter: [...state.foundWords.map(fw => `${fw.word}(${fw.points}p)`), `${newFoundWord.word}(${newFoundWord.points}p)`]
    }, 'GAME_STATE');
    
    setState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, newFoundWord],
      permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
    }));
  }, [state.foundWords]);

  // Calcular pontuação atual
  const currentLevelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);

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
    }
  };
};
