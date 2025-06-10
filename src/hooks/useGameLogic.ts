
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';
import { supabase } from '@/integrations/supabase/client';

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
    console.log(`Resetting game state for level ${level}`);
    setFoundWords([]);
    setPermanentlyMarkedCells([]);
    setHintsUsed(0);
    setShowLevelComplete(false);
    setShowGameOver(false);
    setHintHighlightedCells([]);
    setIsLevelCompleted(false);
  }, [level]);

  // Detecta quando o tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver]);

  // Verifica se completou o nível (5 palavras encontradas)
  useEffect(() => {
    if (foundWords.length === 5 && !showLevelComplete && !isLevelCompleted) {
      const levelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
      console.log(`Level ${level} completed! Total score: ${levelScore}`);
      setShowLevelComplete(true);
      setIsLevelCompleted(true);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete, level, isLevelCompleted]);

  const updateUserScore = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Usuário não autenticado, não foi possível atualizar pontuação');
        return;
      }

      console.log(`💰 Registrando ${points} pontos para o usuário ${user.id}`);

      // Buscar pontuação atual do usuário
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar perfil:', fetchError);
        return;
      }

      const currentScore = profile?.total_score || 0;
      const newScore = currentScore + points;

      console.log(`📊 Pontuação atual: ${currentScore}, nova pontuação: ${newScore}`);

      // Atualizar pontuação no perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_score: newScore })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pontuação:', updateError);
      } else {
        console.log(`✅ Pontuação atualizada com sucesso: +${points} pontos (total: ${newScore})`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação do usuário:', error);
    }
  };

  const addFoundWord = async (word: string, positions: Position[]) => {
    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    console.log(`🎯 Palavra encontrada: "${word}" = ${points} pontos`);
    
    // Adicionar palavra encontrada ao estado
    setFoundWords(prev => [...prev, newFoundWord]);
    setPermanentlyMarkedCells(prev => [...prev, ...positions]);
    
    // Registrar pontos imediatamente na base de dados
    await updateUserScore(points);
    
    // Notificar o componente pai
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
