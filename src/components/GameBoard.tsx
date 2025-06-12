import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Trophy, Target, CheckCircle, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { GameSession, Position, WordFound } from '@/types';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  session: GameSession;
  onGameComplete: (session: GameSession) => void;
}

interface Cell {
  letter: string;
  selected: boolean;
}

const isValidMove = (prev: Position, curr: Position): boolean => {
  if (!prev) return true;
  const dx = Math.abs(curr.row - prev.row);
  const dy = Math.abs(curr.col - prev.col);
  return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
};

const calculateWordPoints = (word: string): number => {
  const baseScore = word.length;
  const multiplier = word.length > 6 ? 2 : 1;
  return baseScore * multiplier;
};

const GameBoard = ({ session, onGameComplete }: GameBoardProps) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [wordsFound, setWordsFound] = useState<WordFound[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      const initialBoard = session.board.map(row =>
        row.map(letter => ({ letter, selected: false }))
      );
      setBoard(initialBoard);
      setCurrentScore(session.total_score);
      setWordsFound(session.words_found as any);
    }
  }, [session]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const togglePause = () => {
    logger.info(isRunning ? 'Jogo pausado' : 'Jogo retomado', { sessionId: session.id }, 'GAME_BOARD');
    setIsRunning(prev => !prev);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isRunning || isSubmitting || isCompleting) return;

    const currentPosition = { row, col };
    const prevPosition = selectedCells.length > 0 ? selectedCells[selectedCells.length - 1] : null;

    if (!isValidMove(prevPosition, currentPosition)) {
      logger.warn('Movimento inválido', { row, col, currentWord: currentWord.substring(0, 10) }, 'GAME_BOARD');
      return;
    }

    if (board[row][col].selected) {
      if (prevPosition && prevPosition.row === row && prevPosition.col === col) {
        return;
      }
      
      const newBoard = board.map((rowArr, i) =>
        rowArr.map((cell, j) =>
          i === row && j === col ? { ...cell, selected: false } : cell
        )
      );
      setBoard(newBoard);
      setSelectedCells(prev => prev.filter(pos => !(pos.row === row && pos.col === col)));
      setCurrentWord(prev => prev.slice(0, -1));
      logger.debug('Desmarcando célula', { row, col, currentWord: currentWord.substring(0, 10) }, 'GAME_BOARD');
    } else {
      const newBoard = board.map((rowArr, i) =>
        rowArr.map((cell, j) =>
          i === row && j === col ? { ...cell, selected: true } : cell
        )
      );
      setBoard(newBoard);
      setSelectedCells(prev => [...prev, { row, col }]);
      setCurrentWord(prev => prev + board[row][col].letter);
      logger.debug('Marcando célula', { row, col, letter: board[row][col].letter, currentWord: currentWord.substring(0, 10) }, 'GAME_BOARD');
    }
  };

  const submitWord = async (word: string, positions: Position[]) => {
    if (!word || word.length < 3) {
      logger.warn('Tentativa de submeter palavra inválida', { word: word.substring(0, 10) }, 'GAME_BOARD');
      return;
    }

    logger.debug('Submetendo palavra', { 
      word: word.substring(0, 10),
      length: word.length,
      sessionId: session.id
    }, 'GAME_BOARD');

    setIsSubmitting(true);
    
    try {
      const points = calculateWordPoints(word);
      const response = await gameService.submitWord(session.id, word, positions, points);
      
      if (response.success && response.data) {
        const newWord = response.data;
        setWordsFound(prev => [...prev, newWord]);
        setCurrentScore(prev => prev + newWord.points);
        setSelectedCells([]);
        setCurrentWord('');
        
        logger.info('Palavra aceita', { 
          word: word.substring(0, 10),
          points: newWord.points,
          sessionId: session.id
        }, 'GAME_BOARD');
        
        toast({
          title: "Palavra encontrada!",
          description: `"${word}" (+${newWord.points} pontos)`,
        });
      } else {
        logger.warn('Palavra rejeitada', { 
          word: word.substring(0, 10),
          error: response.error,
          sessionId: session.id
        }, 'GAME_BOARD');
        
        toast({
          title: "Palavra não encontrada",
          description: response.error || "Tente outra palavra.",
          variant: "destructive",
        });
        
        setSelectedCells([]);
        setCurrentWord('');
      }
    } catch (error) {
      logger.error('Erro ao submeter palavra', { 
        word: word.substring(0, 10),
        error,
        sessionId: session.id
      }, 'GAME_BOARD');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeGame = async () => {
    logger.info('Completando jogo', { 
      sessionId: session.id,
      finalScore: currentScore,
      wordsFound: wordsFound.length
    }, 'GAME_BOARD');
    
    setIsCompleting(true);
    
    try {
      const response = await gameService.completeGameSession(session.id);
      
      if (response.success) {
        logger.info('Jogo finalizado com sucesso', { 
          sessionId: session.id,
          finalScore: currentScore
        }, 'GAME_BOARD');
        onGameComplete(response.data);
      } else {
        logger.error('Erro ao finalizar jogo', { 
          sessionId: session.id,
          error: response.error
        }, 'GAME_BOARD');
      }
    } catch (error) {
      logger.error('Erro ao completar jogo', { 
        sessionId: session.id,
        error
      }, 'GAME_BOARD');
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <Target className="mr-2 h-5 w-5 inline-block align-middle" />
            Desafio
          </CardTitle>
          <Button variant="outline" size="icon" onClick={togglePause} disabled={isCompleting}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <span>Tempo: {formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Pontuação: {currentScore}</span>
            </div>
          </div>
          <Progress value={(timeElapsed / 300) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <div className="flex-grow overflow-auto p-4">
        <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square rounded-lg font-bold text-xl flex items-center justify-center
                  ${cell.selected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}
                  ${isValidMove(selectedCells[selectedCells.length - 1], { row: rowIndex, col: colIndex }) ? 'hover:bg-blue-100' : 'cursor-not-allowed'}
                  transition-colors duration-200`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isRunning || isSubmitting || isCompleting}
              >
                {cell.letter}
              </button>
            ))
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Palavra atual:</h3>
          <Badge variant="secondary">{currentWord}</Badge>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Palavras encontradas:</h3>
          <Badge variant="outline">{wordsFound.length}</Badge>
        </div>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => submitWord(currentWord, selectedCells)} disabled={!isRunning || isSubmitting || isCompleting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                Submetendo...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submeter Palavra
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={completeGame} disabled={isCompleting}>
            {isCompleting ? (
              <>
                <div className="animate-spin mr-2 rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                Finalizando...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Finalizar Jogo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
