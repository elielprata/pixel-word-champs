
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowRight, StopCircle } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80 m-4">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-2" />
            <h2 className="text-xl font-bold text-gray-800">Nível {level} Completado!</h2>
            <p className="text-gray-600 mt-2">Parabéns! Você encontrou todas as palavras.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-center items-center">
              <span className="text-gray-600 mr-2">Pontuação:</span>
              <span className="font-bold text-purple-600 text-lg">{score}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleAdvance}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Iniciar próximo nível
            </Button>
            
            <Button 
              onClick={handleStay}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Quero Parar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelCompleteModal;
