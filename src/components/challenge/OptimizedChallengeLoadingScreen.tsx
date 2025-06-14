import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OptimizedChallengeLoadingScreenProps {
  level: number;
  loadingStep: string;
  metrics?: {
    totalWords: number;
    validWords: number;
    processingTime: number;
    cacheHit: boolean;
  } | null;
}

const OptimizedChallengeLoadingScreen = ({ level, loadingStep, metrics }: OptimizedChallengeLoadingScreenProps) => {
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

  // Determinar cor baseada na performance
  const getProgressColor = () => {
    if (metrics?.cacheHit) return 'bg-green-500'; // Cache hit - verde
    if (metrics && metrics.processingTime < 2000) return 'bg-blue-500'; // Rápido - azul
    if (metrics && metrics.processingTime < 5000) return 'bg-yellow-500'; // Médio - amarelo
    return 'bg-indigo-500'; // Padrão - roxo
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-sm w-full mx-4">
        {/* Spinner otimizado com indicador de cache */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">{level}</span>
          </div>
          {metrics?.cacheHit && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              ⚡
            </div>
          )}
        </div>
        
        {/* Título amigável */}
        <h2 className="text-gray-800 font-bold text-xl mb-2">
          Criando seu Desafio
        </h2>
        
        {/* Nível e info de performance */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Nível {level}
          </p>
          {metrics && (
            <p className="text-gray-500 text-xs mt-1">
              {metrics.cacheHit ? '⚡ Cache' : '🔄 Processando'} • {metrics.totalWords} palavras
            </p>
          )}
        </div>
        
        {/* Progresso com cor dinâmica */}
        <div className="mb-4">
          <Progress 
            value={progress} 
            className="h-2"
            // Aplicar cor baseada na performance
            style={{
              '--progress-background': getProgressColor()
            } as React.CSSProperties}
          />
        </div>
        
        {/* Etapa atual */}
        <p className="text-gray-600 font-medium text-base mb-2">
          {loadingStep}
        </p>
        
        {/* Info de otimização */}
        <div className="text-gray-500 text-xs space-y-1">
          {metrics && (
            <p>
              {metrics.cacheHit ? 'Cache Global' : 'Processamento Híbrido'} • 
              {Math.round(metrics.processingTime)}ms
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedChallengeLoadingScreen;
