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
    logger.info('🎯 Nova palavra encontrada!', { 
      word: foundWord.word,
      points: foundWord.points,
      positions: foundWord.positions,
      totalFoundWords: foundWords.length + 1
    }, 'SIMPLIFIED_GAME');

    setFoundWords(prev => {
      const updated = [...prev, foundWord];
      logger.debug('📝 Palavras encontradas atualizadas', { 
        totalWords: updated.length,
        words: updated.map(fw => ({ word: fw.word, positions: fw.positions }))
      }, 'SIMPLIFIED_GAME');
      return updated;
    });
    
    setCurrentLevelScore(prev => prev + foundWord.points);
    setShowValidWord(true);
    
    // Remover feedback visual após 1 segundo
    setTimeout(() => setShowValidWord(false), 1000);
  }, [foundWords.length]);

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

  // 🆕 FUNÇÃO ATUALIZADA: Usar nova RPC limpa
  const savePointsImmediately = useCallback(async (points: number, word: string) => {
    if (!user?.id) {
      logger.warn('Usuário não autenticado - pontos não salvos', { word, points }, 'SIMPLIFIED_GAME');
      return;
    }

    try {
      logger.info('💾 Salvando pontos com nova RPC limpa', { 
        userId: user.id, 
        points, 
        word,
        timestamp: getCurrentBrasiliaTime() 
      }, 'SIMPLIFIED_GAME');

      // Usar nova função RPC sem ambiguidade de colunas
      const { data, error } = await supabase.rpc('update_user_points_v2', {
        p_user_id: user.id,
        p_points: points
      });

      if (error) {
        throw error;
      }

      logger.info('✅ Pontos salvos com sucesso usando RPC v2', { 
        word, 
        points, 
        newTotalScore: data?.[0]?.total_score,
        newGamesPlayed: data?.[0]?.games_played
      }, 'SIMPLIFIED_GAME');

      return data;
    } catch (error) {
      logger.error('❌ Erro ao salvar pontos com RPC v2', { error, word, points }, 'SIMPLIFIED_GAME');
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
  const handleCellMouseDown = useCallback((row: number, col: number) => {
    const position = { row, col };
    setSelectedCells([position]);
    setIsSelecting(true);
  }, []);

  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting) return;
    
    const position = { row, col };
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

  // 🎯 FUNÇÃO CORRIGIDA: Verificar se célula faz parte de uma palavra encontrada
  const isCellPartOfFoundWord = useCallback((row: number, col: number) => {
    const isPartOfWord = foundWords.some(fw => 
      fw.positions.some(p => p.row === row && p.col === col)
    );
    
    // Debug detalhado para identificar problemas
    if (foundWords.length > 0) {
      logger.debug('🔍 Verificando célula para marcação', {
        cellPosition: { row, col },
        foundWordsCount: foundWords.length,
        foundWordsPositions: foundWords.map(fw => ({
          word: fw.word,
          positions: fw.positions
        })),
        isPartOfWord
      }, 'CELL_MARKING');
    }
    
    return isPartOfWord;
  }, [foundWords]);

  // 🎨 FUNÇÃO CORRIGIDA: Obter índice da palavra para colorir
  const getCellWordIndex = useCallback((row: number, col: number) => {
    for (let i = 0; i < foundWords.length; i++) {
      const word = foundWords[i];
      if (word.positions.some(p => p.row === row && p.col === col)) {
        return i;
      }
    }
    return -1;
  }, [foundWords]);

  // 🌈 FUNÇÃO CORRIGIDA: Obter cor da palavra
  const getWordColor = useCallback((wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-violet-600', 
      'bg-gradient-to-br from-emerald-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-amber-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-teal-600'
    ];
    
    if (wordIndex >= 0 && wordIndex < colors.length) {
      return colors[wordIndex];
    }
    
    // Cor padrão para palavras encontradas
    return 'bg-gradient-to-br from-blue-500 to-blue-600';
  }, []);

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
    selectedCells,
    isSelecting,
    
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
    getCellWordIndex,
    getWordColor,
    
    // Actions
    useHint,
    closeGameOver,
    closeLevelComplete,
    handleGoHome
  };
};
