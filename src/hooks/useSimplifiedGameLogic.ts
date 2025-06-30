
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useWordValidation } from './useWordValidation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface UseSimplifiedGameLogicProps {
  level: number;
  timeLeft: number;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useSimplifiedGameLogic = ({
  level,
  timeLeft,
  onLevelComplete,
  canRevive,
  onRevive
}: UseSimplifiedGameLogicProps) => {
  const { user } = useAuth();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  const { getPointsForWord } = useGamePointsConfig();

  // Estados do jogo
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [currentLevelScore, setCurrentLevelScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);
  
  // Estados de seleção
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showValidWord, setShowValidWord] = useState(false);
  
  // Estados de modais
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // Função para adicionar palavra encontrada
  const handleWordFound = useCallback((foundWord: FoundWord) => {
    setFoundWords(prev => [...prev, foundWord]);
    setCurrentLevelScore(prev => prev + foundWord.points);
    setShowValidWord(true);
    
    // Remover feedback visual após 1 segundo
    setTimeout(() => setShowValidWord(false), 1000);
  }, []);

  // Configurar validação de palavras
  const { validateAndConfirmWord } = useWordValidation({
    boardData,
    levelWords,
    foundWords,
    onWordFound: handleWordFound,
    getPointsForWord
  });

  // Verificar game over
  useEffect(() => {
    if (timeLeft === 0 && foundWords.length < 5) {
      setShowGameOver(true);
      logger.info('Game Over - Tempo esgotado', { 
        level, 
        foundWords: foundWords.length,
        score: currentLevelScore 
      }, 'SIMPLIFIED_GAME');
    }
  }, [timeLeft, foundWords.length, level, currentLevelScore]);

  // Verificar level complete
  useEffect(() => {
    if (foundWords.length >= 5 && !showLevelComplete) {
      setShowLevelComplete(true);
      logger.info('Nível completado!', { 
        level, 
        totalScore: currentLevelScore,
        wordsFound: foundWords.length 
      }, 'SIMPLIFIED_GAME');
      onLevelComplete(currentLevelScore);
    }
  }, [foundWords.length, showLevelComplete, level, currentLevelScore, onLevelComplete]);

  // Função para salvar pontos imediatamente
  const savePointsImmediately = useCallback(async (points: number, word: string) => {
    if (!user?.id) {
      logger.warn('Usuário não autenticado - pontos não salvos', { word, points }, 'SIMPLIFIED_GAME');
      return;
    }

    try {
      logger.info('Salvando pontos imediatamente', { 
        userId: user.id, 
        points, 
        word,
        timestamp: getCurrentBrasiliaTime() 
      }, 'SIMPLIFIED_GAME');

      const { data, error } = await supabase.rpc('update_user_score_simple', {
        p_user_id: user.id,
        p_points: points
      });

      if (error) {
        throw error;
      }

      logger.info('Pontos salvos com sucesso', { 
        word, 
        points, 
        newData: data 
      }, 'SIMPLIFIED_GAME');

      return data;
    } catch (error) {
      logger.error('Erro ao salvar pontos', { error, word, points }, 'SIMPLIFIED_GAME');
    }
  }, [user?.id]);

  // Validar palavra selecionada
  const validateSelectedWord = useCallback(async () => {
    if (selectedCells.length === 0) return;

    const result = validateAndConfirmWord(selectedCells);
    
    if (result) {
      const selectedWord = selectedCells
        .map(pos => boardData.board[pos.row][pos.col])
        .join('');
      
      const points = getPointsForWord(selectedWord);
      
      // Salvar pontos imediatamente
      await savePointsImmediately(points, selectedWord);
    }

    // Limpar seleção
    setSelectedCells([]);
    setIsSelecting(false);
  }, [selectedCells, validateAndConfirmWord, boardData.board, getPointsForWord, savePointsImmediately]);

  // Usar dica
  const useHint = useCallback(() => {
    if (hintsUsed >= 1) return;

    // Encontrar primeira palavra não descoberta (evitar a palavra "extra" de maior pontuação)
    const foundWordTexts = foundWords.map(fw => fw.word);
    const availableWords = levelWords.filter(word => !foundWordTexts.includes(word));
    
    if (availableWords.length === 0) return;

    // Escolher a palavra mais fácil (menor pontuação, evitando a palavra "extra")
    const sortedWords = availableWords.sort((a, b) => a.length - b.length);
    const hintWord = sortedWords[0];

    // Encontrar posições da palavra no tabuleiro
    const placedWord = boardData.placedWords.find(pw => pw.word === hintWord);
    if (!placedWord) return;

    setHintHighlightedCells(placedWord.positions);
    setHintsUsed(1);

    logger.info('Dica usada', { 
      hintWord, 
      positions: placedWord.positions,
      level 
    }, 'SIMPLIFIED_GAME');

    // Remover destaque após 3 segundos
    setTimeout(() => {
      setHintHighlightedCells([]);
    }, 3000);
  }, [hintsUsed, foundWords, levelWords, boardData.placedWords, level]);

  // Handlers de célula
  const handleCellMouseDown = useCallback((position: Position) => {
    setSelectedCells([position]);
    setIsSelecting(true);
  }, []);

  const handleCellMouseEnter = useCallback((position: Position) => {
    if (!isSelecting) return;
    
    setSelectedCells(prev => {
      if (prev.some(p => p.row === position.row && p.col === position.col)) {
        return prev;
      }
      return [...prev, position];
    });
  }, [isSelecting]);

  const handleCellMouseUp = useCallback(() => {
    if (isSelecting) {
      validateSelectedWord();
    }
  }, [isSelecting, validateSelectedWord]);

  // Verificar se célula está destacada por dica
  const isCellHintHighlighted = useCallback((row: number, col: number) => {
    return hintHighlightedCells.some(p => p.row === row && p.col === col);
  }, [hintHighlightedCells]);

  // Verificar se célula está selecionada
  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(p => p.row === row && p.col === col);
  }, [selectedCells]);

  // Verificar se célula faz parte de uma palavra encontrada
  const isCellPartOfFoundWord = useCallback((row: number, col: number) => {
    return foundWords.some(fw => 
      fw.positions.some(p => p.row === row && p.col === col)
    );
  }, [foundWords]);

  // Actions para modais
  const closeGameOver = useCallback(() => setShowGameOver(false), []);
  const closeLevelComplete = useCallback(() => setShowLevelComplete(false), []);
  const handleGoHome = useCallback(() => {
    logger.info('Voltando ao menu principal', { level, finalScore: currentLevelScore }, 'SIMPLIFIED_GAME');
  }, [level, currentLevelScore]);

  return {
    // Estados do tabuleiro
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    
    // Estados do jogo
    foundWords,
    currentLevelScore,
    hintsUsed,
    showValidWord,
    
    // Estados de modais
    showGameOver,
    showLevelComplete,
    
    // Handlers de célula
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    isCellHintHighlighted,
    isCellSelected,
    isCellPartOfFoundWord,
    
    // Actions
    useHint,
    closeGameOver,
    closeLevelComplete,
    handleGoHome
  };
};
