
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface GameifiedLoadingScreenProps {
  level: number;
  loadingStep: string;
  metrics?: {
    totalWords: number;
    validWords: number;
    processingTime: number;
    cacheHit: boolean;
  } | null;
}

// Palavras que aparecem durante o loading - estrutura corrigida
const LOADING_WORDS = [
  { 
    word: 'CACHE', 
    positions: [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
    ]
  },
  { 
    word: 'RAPID', 
    positions: [
      [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]
    ]
  },
  { 
    word: 'WORD', 
    positions: [
      [2, 0], [2, 1], [2, 2], [2, 3]
    ]
  },
  { 
    word: 'GAME', 
    positions: [
      [3, 0], [3, 1], [3, 2], [3, 3]
    ]
  }
];

// Grid base 4x5 para acomodar a palavra CACHE/RAPID
const createBaseGrid = () => {
  return Array(4).fill(null).map(() => Array(5).fill(''));
};

const GameifiedLoadingScreen = ({ level, loadingStep, metrics }: GameifiedLoadingScreenProps) => {
  const [grid, setGrid] = useState(createBaseGrid());
  const [revealedWords, setRevealedWords] = useState<string[]>([]);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());
  const [celebrationMode, setCelebrationMode] = useState(false);

  // Calcular progresso baseado na etapa
  const getProgress = (step: string) => {
    if (step.includes('Iniciando') || step.includes('Preparando')) return 10;
    if (step.includes('cache global')) return 25;
    if (step.includes('Carregando') || step.includes('banco')) return 45;
    if (step.includes('Processando') && step.includes('palavras')) return 70;
    if (step.includes('Validando') || step.includes('Selecionando')) return 85;
    if (step.includes('Gerando') || step.includes('Finalizando') || step.includes('concluído')) return 95;
    if (step.includes('Tentando novamente') || step.includes('cache de emergência')) return 30;
    return 50;
  };

  const progress = getProgress(loadingStep);

  // Determinar qual palavra revelar baseado no progresso
  const getWordsToReveal = (progress: number) => {
    const words = [];
    if (progress >= 25) words.push('CACHE');
    if (progress >= 50) words.push('RAPID');
    if (progress >= 70) words.push('WORD');
    if (progress >= 90) words.push('GAME');
    return words;
  };

  // Atualizar grid com palavras reveladas - lógica corrigida
  useEffect(() => {
    const wordsToReveal = getWordsToReveal(progress);
    const newGrid = createBaseGrid();
    const newRevealedWords: string[] = [];

    wordsToReveal.forEach(wordText => {
      const wordData = LOADING_WORDS.find(w => w.word === wordText);
      if (wordData && wordData.positions) {
        newRevealedWords.push(wordText);
        
        // Correção: iterar sobre as letras da palavra e suas posições correspondentes
        const letters = wordData.word.split('');
        letters.forEach((letter, index) => {
          if (index < wordData.positions.length) {
            const position = wordData.positions[index];
            if (Array.isArray(position) && position.length === 2) {
              const [row, col] = position;
              if (row >= 0 && row < 4 && col >= 0 && col < 5) {
                newGrid[row][col] = letter;
              }
            }
          }
        });
      }
    });

    setGrid(newGrid);
    setRevealedWords(newRevealedWords);
  }, [progress]);

  // Efeito de celebração para cache hits
  useEffect(() => {
    if (metrics?.cacheHit && !celebrationMode) {
      setCelebrationMode(true);
      setTimeout(() => setCelebrationMode(false), 2000);
    }
  }, [metrics?.cacheHit, celebrationMode]);

  // Determinar cor de fundo baseada na performance
  const getBackgroundGradient = () => {
    if (metrics?.cacheHit) {
      return 'from-green-50 via-emerald-50 to-teal-50';
    }
    if (metrics && metrics.processingTime > 5000) {
      return 'from-yellow-50 via-amber-50 to-orange-50';
    }
    return 'from-indigo-50 via-purple-50 to-pink-50';
  };

  const cellSize = 40; // Reduzido para acomodar 5 colunas

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000`}>
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-md w-full mx-4 relative overflow-hidden">
        
        {/* Efeitos de celebração para cache hits */}
        {celebrationMode && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 text-2xl animate-bounce">⚡</div>
            <div className="absolute top-4 right-4 text-2xl animate-bounce delay-100">✨</div>
            <div className="absolute bottom-4 left-4 text-2xl animate-bounce delay-200">🚀</div>
            <div className="absolute bottom-4 right-4 text-2xl animate-bounce delay-300">💫</div>
          </div>
        )}

        {/* Título com indicador de nível */}
        <div className="mb-6">
          <div className="relative inline-block">
            <div className={`w-16 h-16 rounded-full border-4 ${metrics?.cacheHit ? 'border-green-500 bg-green-100' : 'border-indigo-500 bg-indigo-100'} flex items-center justify-center mx-auto mb-4 transition-all duration-500`}>
              <span className={`font-bold text-lg ${metrics?.cacheHit ? 'text-green-700' : 'text-indigo-700'}`}>{level}</span>
            </div>
            {metrics?.cacheHit && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-pulse">
                ⚡
              </div>
            )}
          </div>
          
          <h2 className="text-gray-800 font-bold text-xl mb-2">
            {metrics?.cacheHit ? 'Carregamento Turbo!' : 'Preparando Desafio'}
          </h2>
          <p className="text-gray-600 text-sm">
            Nível {level} • Descobrindo palavras...
          </p>
        </div>

        {/* Grid gamificado 4x5 */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-1 justify-center mx-auto" style={{ width: `${cellSize * 5 + 16}px` }}>
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const isAnimating = animatingCells.has(cellKey);
                const isRevealed = letter !== '';
                
                return (
                  <div
                    key={cellKey}
                    className={`
                      flex items-center justify-center font-bold rounded-lg transition-all duration-500
                      ${isRevealed 
                        ? `bg-gradient-to-br ${metrics?.cacheHit ? 'from-green-400 to-emerald-500' : 'from-indigo-400 to-purple-500'} text-white transform scale-100` 
                        : 'bg-gray-100 text-gray-300 transform scale-95'
                      }
                      ${isAnimating ? 'animate-pulse' : ''}
                      ${celebrationMode && isRevealed ? 'animate-bounce' : ''}
                    `}
                    style={{ 
                      width: `${cellSize}px`, 
                      height: `${cellSize}px`,
                      fontSize: `${cellSize * 0.4}px`
                    }}
                  >
                    {letter || '?'}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Palavras encontradas */}
        {revealedWords.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Palavras encontradas:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {revealedWords.map((word, index) => (
                <span
                  key={word}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium animate-fade-in
                    ${metrics?.cacheHit 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    }
                  `}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Barra de progresso temática */}
        <div className="mb-4">
          <Progress 
            value={progress} 
            className="h-3 rounded-full overflow-hidden"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span className={metrics?.cacheHit ? 'text-green-600 font-medium' : ''}>
              {Math.round(progress)}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Status atual */}
        <p className={`font-medium text-base mb-3 ${metrics?.cacheHit ? 'text-green-700' : 'text-gray-700'}`}>
          {loadingStep}
        </p>

        {/* Métricas de performance */}
        {metrics && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className={`font-medium ${metrics.cacheHit ? 'text-green-600' : 'text-blue-600'}`}>
                {metrics.cacheHit ? '⚡ Cache Global' : '🔄 Processamento Híbrido'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Palavras:</span>
              <span className="font-medium">{metrics.totalWords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tempo:</span>
              <span className={`font-medium ${metrics.processingTime < 2000 ? 'text-green-600' : metrics.processingTime < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(metrics.processingTime)}ms
              </span>
            </div>
          </div>
        )}

        {/* Dica motivacional */}
        <div className="mt-4 text-xs text-gray-500 italic">
          {metrics?.cacheHit 
            ? "🚀 Velocidade máxima ativada!" 
            : "🎯 Processando palavras especiais para você..."
          }
        </div>
      </div>
    </div>
  );
};

export default GameifiedLoadingScreen;
