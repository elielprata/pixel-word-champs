
import { useState, useEffect, useCallback, useRef } from 'react';
import { Position, WordFound, GameConfig } from '@/types';
import { gameService } from '@/services/gameService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseGameLogicProps {
  config: GameConfig;
  onLevelComplete?: (score: number, timeElapsed: number) => void;
  onGameComplete?: (totalScore: number) => void;
}

export const useGameLogic = ({ config, onLevelComplete, onGameComplete }: UseGameLogicProps) => {
  const { toast } = useToast();
  const [board, setBoard] = useState<string[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<string[]>([]);
  const [wordsFound, setWordsFound] = useState<WordFound[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎮 Inicializando jogo para nível:', config.level);

      const gameData = await gameService.generateBoard(config.level, config.competitionId);
      
      if (!gameData.success || !gameData.data) {
        throw new Error(gameData.error || 'Erro ao gerar tabuleiro');
      }

      const { board: newBoard, words, sessionId } = gameData.data;
      
      setBoard(newBoard);
      setWordsToFind(words);
      setWordsFound([]);
      setCurrentScore(0);
      setGameSessionId(sessionId);
      sessionRef.current = sessionId;

      console.log('✅ Jogo inicializado com sucesso');
      console.log('📋 Palavras para encontrar:', words.length);
      console.log('🆔 Session ID:', sessionId);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar jogo:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Não foi possível inicializar o jogo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [config.level, config.competitionId, toast]);

  const findWord = useCallback(async (positions: Position[]): Promise<boolean> => {
    if (!sessionRef.current) {
      console.error('❌ Session ID não encontrado');
      return false;
    }

    try {
      console.log('🔍 Tentando encontrar palavra nas posições:', positions);
      
      const result = await gameService.validateWord(
        sessionRef.current,
        positions,
        board
      );

      if (result.success && result.data) {
        const { word, points } = result.data;
        
        const newWordFound: WordFound = {
          word,
          points,
          positions,
          foundAt: new Date().toISOString()
        };

        setWordsFound(prev => [...prev, newWordFound]);
        setCurrentScore(prev => prev + points);

        console.log('✅ Palavra encontrada:', word, 'Pontos:', points);
        
        toast({
          title: "Palavra encontrada!",
          description: `${word} (+${points} pontos)`,
        });

        return true;
      } else {
        console.log('❌ Palavra não encontrada ou inválida');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao validar palavra:', error);
      return false;
    }
  }, [board, toast]);

  const completeLevel = useCallback(async (timeElapsed: number) => {
    if (!sessionRef.current) {
      console.error('❌ Session ID não encontrado para completar nível');
      return;
    }

    try {
      console.log('🏁 Completando nível com sessão:', sessionRef.current);
      
      const result = await gameService.completeSession(
        sessionRef.current,
        currentScore,
        timeElapsed,
        wordsFound
      );

      if (result.success) {
        console.log('✅ Sessão completada com sucesso');
        
        // Não chamamos mais update_weekly_ranking pois foi removido
        console.log('📊 Pontuação final:', currentScore);
        
        onLevelComplete?.(currentScore, timeElapsed);
      } else {
        throw new Error(result.error || 'Erro ao completar sessão');
      }
    } catch (error) {
      console.error('❌ Erro ao completar nível:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar progresso do jogo.",
        variant: "destructive",
      });
    }
  }, [currentScore, wordsFound, onLevelComplete, toast]);

  const resetGame = useCallback(() => {
    setBoard([]);
    setWordsToFind([]);
    setWordsFound([]);
    setCurrentScore(0);
    setError(null);
    setGameSessionId(null);
    sessionRef.current = null;
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const isGameComplete = wordsToFind.length > 0 && wordsFound.length === wordsToFind.length;
  const progress = wordsToFind.length > 0 ? (wordsFound.length / wordsToFind.length) * 100 : 0;

  return {
    board,
    wordsToFind,
    wordsFound,
    currentScore,
    isLoading,
    error,
    gameSessionId,
    isGameComplete,
    progress,
    findWord,
    completeLevel,
    resetGame,
    initializeGame
  };
};
