
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

export const useGameLogic = (
  level: number,
  timeLeft: number,
  levelWords: string[],
  onWordFound: (word: string, points: number) => void,
  onLevelComplete: (levelScore: number) => void
) => {
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [permanentlyMarkedCells, setPermanentlyMarkedCells] = useState<Position[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  
  const { getPointsForWord } = useGamePointsConfig();

  // Reset state when level changes
  useEffect(() => {
    logger.log(`Resetting game state for level ${level}`);
    setFoundWords([]);
    setPermanentlyMarkedCells([]);
    setHintsUsed(0);
    setShowLevelComplete(false);
    setShowGameOver(false);
    setHintHighlightedCells([]);
    setIsLevelCompleted(false);
  }, [level]);

  // Detecta quando o tempo acaba - removido log repetitivo
  useEffect(() => {
    if (timeLeft === 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver]);

  // Verifica se completou o nível - corrigido para usar levelWords.length
  useEffect(() => {
    if (foundWords.length === levelWords.length && levelWords.length > 0 && !showLevelComplete && !isLevelCompleted) {
      const levelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
      logger.log(`Level ${level} completed with score ${levelScore} - NOW registering points in database. Words found: ${foundWords.length}/${levelWords.length}`);
      
      setShowLevelComplete(true);
      setIsLevelCompleted(true);
      
      // Só agora registra os pontos no banco de dados
      updateUserScore(levelScore);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete, level, isLevelCompleted, levelWords.length]);

  const updateUserScore = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('⚠️ Usuário não autenticado, não é possível atualizar pontuação');
        return;
      }

      logger.log(`🔄 Registrando pontuação do nível completado para usuário ${user.id}: +${points} pontos`);

      // Buscar pontuação atual do usuário
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        logger.error('❌ Erro ao buscar perfil:', fetchError);
        return;
      }

      const currentScore = profile?.total_score || 0;
      const newScore = currentScore + points;

      // Atualizar pontuação no perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_score: newScore,
          games_played: (profile?.games_played || 0) + 1 // Incrementa games_played quando completa nível
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('❌ Erro ao atualizar pontuação:', updateError);
        throw updateError;
      }

      logger.log(`✅ Pontuação do nível completado registrada: ${currentScore} → ${newScore} (+${points})`);

      // Forçar atualização do ranking semanal
      try {
        const { error: rankingError } = await supabase.rpc('update_weekly_ranking');
        if (rankingError) {
          logger.warn('⚠️ Erro ao atualizar ranking semanal:', rankingError);
        } else {
          logger.log('✅ Ranking semanal atualizado após completar nível');
        }
      } catch (rankingUpdateError) {
        logger.warn('⚠️ Erro ao forçar atualização do ranking:', rankingUpdateError);
      }

    } catch (error) {
      logger.error('❌ Erro ao atualizar pontuação do usuário:', error);
    }
  };

  const addFoundWord = async (word: string, positions: Position[]) => {
    // PROTEÇÃO: Verificar se a palavra já foi encontrada
    const isAlreadyFound = foundWords.some(fw => fw.word === word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ Tentativa de adicionar palavra duplicada: "${word}" - IGNORANDO`, 'GAME_LOGIC');
      return;
    }

    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    logger.log(`📝 Adicionando palavra única: "${word}" = ${points} pontos (${foundWords.length + 1}/${levelWords.length})`);
    
    setFoundWords(prev => {
      // Verificação adicional antes de adicionar
      if (prev.some(fw => fw.word === word)) {
        logger.warn(`⚠️ Palavra já existe no array: "${word}" - não adicionando duplicata`);
        return prev;
      }
      const newArray = [...prev, newFoundWord];
      logger.log(`📊 Array de palavras atualizado. Total: ${newArray.length} palavras encontradas`);
      return newArray;
    });
    
    setPermanentlyMarkedCells(prev => [...prev, ...positions]);
    
    // Chama callback para UI - NÃO registra pontos aqui
    onWordFound(word, points);
  };

  const isCellPermanentlyMarked = (row: number, col: number) => {
    return permanentlyMarkedCells.some(pos => pos.row === row && pos.col === col);
  };

  const isCellHintHighlighted = (row: number, col: number) => {
    return hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  // Função para fechar o modal do Game Over (usado no revive)
  const closeGameOver = () => {
    setShowGameOver(false);
  };

  return {
    foundWords,
    permanentlyMarkedCells,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    hintHighlightedCells,
    isLevelCompleted,
    setHintsUsed,
    setShowGameOver,
    setShowLevelComplete,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver
  };
};
