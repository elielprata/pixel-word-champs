
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import RankingScreen from './RankingScreen';
import { logger } from '@/utils/logger';

interface FullRankingScreenProps {
  onBack: () => void;
}

const FullRankingScreen = ({ onBack }: FullRankingScreenProps) => {
  logger.debug('FullRankingScreen carregado', undefined, 'FULL_RANKING_SCREEN');

  const handleBack = () => {
    logger.debug('Voltando do ranking completo', undefined, 'FULL_RANKING_SCREEN');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="p-4 flex items-center mb-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-purple-800 ml-3">Ranking Completo</h1>
      </div>
      
      <div className="px-4">
        <RankingScreen />
      </div>
    </div>
  );
};

export default FullRankingScreen;
