
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface ProcessingMetrics {
  totalWords: number;
  validWords: number;
  processingTime: number;
  cacheHit: boolean;
}

interface GameBoardLoadingStateGamifiedProps {
  level: number;
  debugInfo?: string;
  metrics?: ProcessingMetrics | null;
}

const GameBoardLoadingStateGamified = ({ level, debugInfo, metrics }: GameBoardLoadingStateGamifiedProps) => {
  const [progress, setProgress] = useState(0);
  const [animatedLetters, setAnimatedLetters] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Palavras do loading que aparecem conforme progresso
  const loadingWords = ['CACHE', 'RAPID', 'WORDS', 'GAME'];
  
  // Grid 4x4 para o mini tabuleiro
  const gridSize = 4;

  // Calcular progresso baseado na etapa de debug
  const getProgress = (step: string) => {
    if (step?.includes('Iniciando') || step?.includes('Preparando')) return 15;
    if (step?.includes('cache global')) return 30;
    if (step?.includes('Carregando') || step?.includes('banco')) return 50;
    if (step?.includes('Processando') && step?.includes('palavras')) return 75;
    if (step?.includes('Validando') || step?.includes('Selecionando')) return 90;
    if (step?.includes('Gerando') || step?.includes('Finalizando') || step?.includes('concluído')) return 100;
    if (step?.includes('Tentando novamente') || step?.includes('cache de emergência')) return 40;
    return 25;
  };

  // Inicializar grid vazio
  useEffect(() => {
    const emptyGrid = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill('')
    );
    setAnimatedLetters(emptyGrid);
  }, []);

  // Atualizar progresso baseado no debugInfo
  useEffect(() => {
    if (debugInfo) {
      const newProgress = getProgress(debugInfo);
      setProgress(newProgress);
    }
  }, [debugInfo]);

  // Animar letras conforme progresso
  useEffect(() => {
    const interval = setInterval(() => {
      if (progress < 100 && currentWordIndex < loadingWords.length) {
        const currentWord = loadingWords[currentWordIndex];
        const wordProgress = (progress / 100) * loadingWords.length;
        
        if (wordProgress > currentWordIndex + 0.8 && !foundWords.includes(currentWord)) {
          // "Encontrar" palavra no grid
          setFoundWords(prev => [...prev, currentWord]);
          setCurrentWordIndex(prev => prev + 1);
          
          // Atualizar grid com letras da palavra
          setAnimatedLetters(prevGrid => {
            const newGrid = [...prevGrid];
            const startRow = Math.floor(currentWordIndex / 2);
            const startCol = currentWordIndex % 2 === 0 ? 0 : 1;
            
            currentWord.split('').forEach((letter, index) => {
              if (startRow < gridSize && startCol + index < gridSize) {
                newGrid[startRow][startCol + index] = letter;
              }
            });
            
            return newGrid;
          });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [progress, currentWordIndex, foundWords, loadingWords]);

  // Determinar cor da barra baseada na performance
  const getProgressColor = () => {
    if (metrics?.cacheHit) return 'bg-green-500'; // Cache hit - verde
    if (metrics && metrics.processingTime < 2000) return 'bg-blue-500'; // Rápido - azul
    if (metrics && metrics.processingTime < 5000) return 'bg-yellow-500'; // Médio - amarelo
    return 'bg-indigo-500'; // Padrão - roxo
  };

  // Determinar se célula faz parte de palavra encontrada
  const isCellHighlighted = (row: number, col: number) => {
    return animatedLetters[row][col] !== '';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40 max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Header com nível e indicadores */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {level}
              </div>
              {metrics?.cacheHit && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-bounce">
                  ⚡
                </div>
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Preparando Tabuleiro</h3>
          <p className="text-sm text-gray-600">Nível {level}</p>
        </div>

        {/* Mini Tabuleiro 4x4 */}
        <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
          <div className="grid grid-cols-4 gap-1">
            {animatedLetters.map((row, rowIndex) =>
              row.map((letter, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-500
                    ${isCellHighlighted(rowIndex, colIndex)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-lg animate-pulse'
                      : 'bg-white border-gray-200 text-gray-400'
                    }
                  `}
                >
                  {letter && (
                    <span className="animate-scale-in">
                      {letter}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Palavras Encontradas */}
        {foundWords.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Palavras Encontradas:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {foundWords.map((word, index) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-semibold animate-fade-in border border-green-300"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  ✓ {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Progresso Temática */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Progresso</span>
            <span className={`font-semibold ${metrics?.cacheHit ? 'text-green-600' : 'text-indigo-600'}`}>
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-3 bg-gray-200"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
            
            {/* Sparkles para cache hit */}
            {metrics?.cacheHit && (
              <div className="absolute top-0 right-0 text-yellow-400 animate-bounce">
                ✨
              </div>
            )}
          </div>
        </div>

        {/* Info de Performance */}
        <div className="text-center space-y-1">
          {debugInfo && (
            <p className="text-sm font-medium text-gray-700">
              {debugInfo}
            </p>
          )}
          
          {metrics && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                {metrics.cacheHit ? '⚡ Cache Ativo' : '🔄 Processando'} • {metrics.totalWords} palavras
              </p>
              {metrics.processingTime > 0 && (
                <p>
                  ⏱️ {Math.round(metrics.processingTime)}ms • 
                  <span className={`ml-1 font-semibold ${
                    metrics.processingTime < 1000 ? 'text-green-600' :
                    metrics.processingTime < 3000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.processingTime < 1000 ? 'Ultrarrápido' :
                     metrics.processingTime < 3000 ? 'Rápido' : 'Carregando...'}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dica de Gamificação */}
        <div className="text-center">
          <p className="text-xs text-gray-400 italic">
            🎮 Encontrando palavras para seu tabuleiro...
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameBoardLoadingStateGamified;
