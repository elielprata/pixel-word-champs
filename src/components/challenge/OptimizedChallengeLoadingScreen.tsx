
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OptimizedChallengeLoadingScreenProps {
  level: number;
  loadingStep: string;
}

const OptimizedChallengeLoadingScreen = ({ level, loadingStep }: OptimizedChallengeLoadingScreenProps) => {
  // Calcular progresso baseado na etapa
  const getProgress = (step: string) => {
    if (step.includes('Iniciando') || step.includes('Preparando')) return 10;
    if (step.includes('Buscando') || step.includes('cache')) return 40;
    if (step.includes('Selecionando') || step.includes('Processando')) return 70;
    if (step.includes('Gerando') || step.includes('Finalizando')) return 90;
    if (step.includes('Tentando novamente')) return 20;
    return 50;
  };

  const progress = getProgress(loadingStep);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-sm w-full mx-4">
        {/* Spinner otimizado */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">{level}</span>
          </div>
        </div>
        
        {/* Título amigável */}
        <h2 className="text-gray-800 font-bold text-xl mb-2">
          Criando seu Desafio
        </h2>
        
        {/* Nível */}
        <p className="text-gray-600 text-sm mb-4">
          Nível {level}
        </p>
        
        {/* Progresso */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Etapa atual */}
        <p className="text-gray-600 font-medium text-base mb-2">
          {loadingStep}
        </p>
        
        {/* Dica */}
        <p className="text-gray-500 text-xs">
          Otimizado para velocidade ⚡
        </p>
      </div>
    </div>
  );
};

export default OptimizedChallengeLoadingScreen;
