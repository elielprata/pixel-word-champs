
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useCellInteractions } from './useCellInteractions';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

interface SimpleGameBoardProps {
  level: number;
  timeLeft: number;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

const POINTS_PER_WORD = 10; // Pontos fixos por palavra
const WORDS_TO_COMPLETE_LEVEL = 15; // Palavras necessárias para completar o nível

export const useSimpleGameBoard = ({
  level,
  timeLeft,
  onLevelComplete,
  canRevive,
  onRevive
}: SimpleGameBoardProps) => {
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { user } = useAuth();
  const levelCompleteHandled = useRef(false);
  const gameOverHandled = useRef(false);

  // Hook para board otimizado
  const { 
    boardData, 
    size,
    levelWords, 
    isLoading: boardLoading,
    error: boardError
  } = useOptimizedBoard(level);

  // ✅ FLUXO SIMPLIFICADO: Função para salvar pontos imediatamente
  const savePointsImmediately = useCallback(async (points: number) => {
    if (!user?.id) {
      logger.error('❌ Usuário não autenticado para salvar pontos', {}, 'SIMPLE_GAME_BOARD');
      return false;
    }

    try {
      logger.info('💾 Salvando pontos imediatamente', { 
        userId: user.id, 
        points,
        timestamp: getCurrentBrasiliaTime()
      }, 'SIMPLE_GAME_BOARD');

      const { data, error } = await supabase.rpc('update_user_score_simple', {
        p_user_id: user.id,
        p_points: points
      });

      if (error) throw error;

      logger.info('✅ Pontos salvos com sucesso', { 
        userId: user.id, 
        points,
        newTotalScore: data?.[0]?.total_score
      }, 'SIMPLE_GAME_BOARD');

      return true;
    } catch (error) {
      logger.error('❌ Erro ao salvar pontos', { 
        error, 
        userId: user.id, 
        points 
      }, 'SIMPLE_GAME_BOARD');
      return false;
    }
  }, [user?.id]);

  // ✅ FLUXO SIMPLIFICADO: Criar sessão simples (apenas para histórico)
  const createSimpleSession = useCallback(async () => {
    if (!user?.id || !boardData) return null;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          level,
          board: boardData as any, // Cast para Json
          words_found: [],
          total_score: 0,
          time_elapsed: 0,
          is_completed: false,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('✅ Sessão simples criada', { 
        sessionId: data.id, 
        level 
      }, 'SIMPLE_GAME_BOARD');

      return data.id;
    } catch (error) {
      logger.error('❌ Erro ao criar sessão', { error, level }, 'SIMPLE_GAME_BOARD');
      return null;
    }
  }, [user?.id, level, boardData]);

  // ✅ FLUXO SIMPLIFICADO: Processar palavra encontrada
  const handleWordFound = useCallback(async (foundWord: FoundWord) => {
    const { word, positions, points } = foundWord;
    
    logger.info('🎯 Palavra encontrada - processamento simples', {
      word,
      points,
      timestamp: getCurrentBrasiliaTime()
    }, 'SIMPLE_GAME_BOARD');

    // 1. Adicionar ao estado visual imediatamente
    setFoundWords(prev => [...prev, foundWord]);
    
    // 2. Atualizar score local
    const newScore = currentScore + points;
    setCurrentScore(newScore);

    // 3. Salvar pontos no banco imediatamente
    await savePointsImmediately(points);

    // 4. Verificar se completou o nível
    const totalWordsFound = foundWords.length + 1;
    if (totalWordsFound >= WORDS_TO_COMPLETE_LEVEL && !levelCompleteHandled.current) {
      levelCompleteHandled.current = true;
      setShowLevelComplete(true);
      onLevelComplete(newScore);
      
      logger.info('🏆 Nível completado!', { 
        totalWords: totalWordsFound,
        finalScore: newScore,
        level
      }, 'SIMPLE_GAME_BOARD');
    }

    return true;
  }, [currentScore, foundWords.length, savePointsImmediately, onLevelComplete, level]);

  // Interações com células
  const cellInteractions = useCellInteractions({
    foundWords,
    permanentlyMarkedCells: new Set(),
    hintHighlightedCells: new Set(),
    boardData,
    levelWords,
    onWordFound: handleWordFound
  });

  // ✅ INICIALIZAÇÃO SIMPLES
  useEffect(() => {
    if (boardData && levelWords.length > 0 && !sessionId) {
      createSimpleSession().then((id) => {
        setSessionId(id);
        setIsLoading(false);
      });
    }
  }, [boardData, levelWords, sessionId, createSimpleSession]);

  // ✅ GAME OVER SIMPLES
  useEffect(() => {
    if (timeLeft <= 0 && !showLevelComplete && !gameOverHandled.current) {
      gameOverHandled.current = true;
      setShowGameOver(true);
      
      logger.info('⏰ Tempo esgotado', { 
        level, 
        foundWords: foundWords.length,
        finalScore: currentScore
      }, 'SIMPLE_GAME_BOARD');
    }
  }, [timeLeft, showLevelComplete, foundWords.length, currentScore, level]);

  // Função para usar dica
  const useHint = useCallback(() => {
    if (hintsUsed >= 3) return;
    
    setHintsUsed(prev => prev + 1);
    logger.info('💡 Dica usada', { hintsUsed: hintsUsed + 1 }, 'SIMPLE_GAME_BOARD');
  }, [hintsUsed]);

  // Funções de controle
  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu', { level }, 'SIMPLE_GAME_BOARD');
  }, [level]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  // Verificar erros
  useEffect(() => {
    if (boardError) {
      setError(boardError);
      setIsLoading(false);
    }
  }, [boardError]);

  return {
    // Estados do jogo
    isLoading: isLoading || boardLoading,
    error,
    foundWords,
    currentScore,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    
    // Props do board
    boardData,
    size,
    levelWords,
    
    // Interações com células
    selectedCells: cellInteractions.selectedCells,
    isDragging: cellInteractions.isDragging,
    handleCellStart: cellInteractions.handleCellStart,
    handleCellMove: cellInteractions.handleCellMove,
    handleCellEnd: cellInteractions.handleCellEnd,
    isCellSelected: cellInteractions.isCellSelected,
    isCellPermanentlyMarked: cellInteractions.isCellPermanentlyMarked,
    isCellHintHighlighted: cellInteractions.isCellHintHighlighted,
    getCellWordIndex: cellInteractions.getCellWordIndex,
    getWordColor: cellInteractions.getWordColor,
    
    // Ações do jogo
    useHint,
    handleGoHome,
    closeGameOver
  };
};
