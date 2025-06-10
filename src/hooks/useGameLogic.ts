
import { useState, useEffect, useCallback, useRef } from 'react';
import { Position, WordFound, GameConfig } from '@/types';
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

  // Função simples para gerar tabuleiro
  const generateSimpleBoard = (size = 10): string[][] => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const board: string[][] = [];
    
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
    
    return board;
  };

  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎮 Inicializando jogo para nível:', config.level);

      // Gerar tabuleiro simples
      const newBoard = generateSimpleBoard(10);
      
      // Buscar palavras do nível
      const { data: levelWordsData, error: wordsError } = await supabase
        .from('level_words')
        .select('word')
        .eq('level', config.level)
        .eq('is_active', true)
        .limit(5);

      if (wordsError) throw wordsError;

      const words = levelWordsData?.map(w => w.word.toUpperCase()) || [];
      
      // Criar sessão de jogo
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            level: config.level,
            board: newBoard,
            words_found: [],
            total_score: 0,
            time_elapsed: 0,
            is_completed: false
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        
        setGameSessionId(sessionData.id);
        sessionRef.current = sessionData.id;
      }
      
      setBoard(newBoard);
      setWordsToFind(words);
      setWordsFound([]);
      setCurrentScore(0);

      console.log('✅ Jogo inicializado com sucesso');
      console.log('📋 Palavras para encontrar:', words.length);
      
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
      
      // Validação simples da palavra
      const word = positions.map(pos => board[pos.row][pos.col]).join('');
      
      if (wordsToFind.includes(word) && !wordsFound.some(fw => fw.word === word)) {
        const points = word.length * 10;
        
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
  }, [board, wordsToFind, wordsFound, toast]);

  const completeLevel = useCallback(async (timeElapsed: number) => {
    if (!sessionRef.current) {
      console.error('❌ Session ID não encontrado para completar nível');
      return;
    }

    try {
      console.log('🏁 Completando nível com sessão:', sessionRef.current);
      
      // Atualizar sessão como completada
      const { error } = await supabase
        .from('game_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          total_score: currentScore,
          time_elapsed: timeElapsed
        })
        .eq('id', sessionRef.current);

      if (error) throw error;

      console.log('✅ Sessão completada com sucesso');
      console.log('📊 Pontuação final:', currentScore);
      
      onLevelComplete?.(currentScore, timeElapsed);
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
