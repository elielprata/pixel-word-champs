
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import RankingScreen from './RankingScreen';

interface FullRankingScreenProps {
  onBack: () => void;
}

const FullRankingScreen = ({ onBack }: FullRankingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="p-4 flex items-center mb-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-purple-800 ml-3">Ranking Completo</h1>
      </div>
      
      <div className="px-4">
        <RankingScreen onBack={onBack} />
      </div>
    </div>
  );
};

export default FullRankingScreen;
