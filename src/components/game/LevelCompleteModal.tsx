
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowRight, StopCircle, Star, Sparkles, Crown } from 'lucide-react';
import { logger } from '@/utils/logger';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: number;
  score: number;
  onAdvance: () => void;
  onStay: () => void;
}

const LevelCompleteModal = ({ 
  isOpen, 
  level, 
  score, 
  onAdvance, 
  onStay 
}: LevelCompleteModalProps) => {
  
  // Log sempre que o componente renderiza
  logger.debug('🏆 LevelCompleteModal renderizado', { 
    isOpen, 
    level, 
    score 
  }, 'LEVEL_COMPLETE_MODAL');

  if (!isOpen) {
    logger.debug('🏆 Modal fechado - não exibindo', { level }, 'LEVEL_COMPLETE_MODAL');
    return null;
  }

  logger.info('🎉 Modal de nível completado ABERTO e VISÍVEL', { 
    level, 
    score 
  }, 'LEVEL_COMPLETE_MODAL');

  const handleAdvance = () => {
    logger.info('▶️ Usuário escolheu avançar para próximo nível', { 
      level,
      score 
    }, 'LEVEL_COMPLETE_MODAL');
    onAdvance();
  };

  const handleStay = () => {
    logger.info('🛑 Usuário escolheu parar no nível atual', { 
      level,
      score 
    }, 'LEVEL_COMPLETE_MODAL');
    onStay();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {/* Partículas de celebração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.8s' }} />
        <div className="absolute top-3/4 left-1/2 w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.3s' }} />
      </div>

      <Card className="w-96 m-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-2xl shadow-amber-500/20 animate-scale-in">
        <CardContent className="p-8 text-center relative overflow-hidden">
          {/* Fundo decorativo com gradiente animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-yellow-100/30 to-orange-100/50 animate-pulse" />
          
          {/* Estrelas decorativas */}
          <div className="absolute top-4 left-6">
            <Star className="w-4 h-4 text-yellow-400 animate-pulse" fill="currentColor" />
          </div>
          <div className="absolute top-8 right-8">
            <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
          </div>
          <div className="absolute bottom-6 left-8">
            <Star className="w-3 h-3 text-orange-400 animate-pulse" fill="currentColor" />
          </div>
          
          <div className="relative z-10">
            {/* Seção do troféu com animação */}
            <div className="mb-6 relative">
              <div className="relative inline-block">
                <Crown className="w-20 h-20 mx-auto text-amber-500 mb-3 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in">
                🎉 Nível {level} Completado! 🎉
              </h2>
              <p className="text-gray-600 text-lg font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Parabéns! Você encontrou todas as palavras!
              </p>
            </div>
            
            {/* Seção da pontuação com destaque */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="text-white/90 text-sm font-medium">Sua Pontuação</p>
                  <p className="text-white text-3xl font-bold">{score}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              
              {/* Barra de celebração */}
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full animate-pulse" />
              </div>
            </div>
            
            {/* Botões de ação com estilo gamificado */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button 
                onClick={handleAdvance}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
              >
                <ArrowRight className="w-5 h-5 mr-3" />
                <span className="font-bold">Próximo Nível</span>
                <Sparkles className="w-5 h-5 ml-3" />
              </Button>
              
              <Button 
                onClick={handleStay}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400"
              >
                <StopCircle className="w-5 h-5 mr-3" />
                <span className="font-bold">Finalizar Jogo</span>
              </Button>
            </div>

            {/* Indicador de progresso salvo */}
            <div className="mt-4 p-2 bg-green-900/20 rounded-lg border border-green-600/30">
              <p className="text-sm text-green-700 font-medium">
                ✅ Progresso salvo automaticamente!
              </p>
            </div>
          </div>
          
          {/* Efeitos de brilho nos cantos */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-yellow-200/40 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-orange-200/40 to-transparent rounded-full blur-xl" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelCompleteModal;
