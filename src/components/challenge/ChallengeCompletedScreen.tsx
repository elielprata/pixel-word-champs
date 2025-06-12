
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Star } from 'lucide-react';

interface ChallengeCompletedScreenProps {
  totalScore: number;
  onCompleteGame: () => void;
}

const ChallengeCompletedScreen = ({ totalScore, onCompleteGame }: ChallengeCompletedScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 flex items-center justify-center">
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto border border-white/30">
        <div className="relative mb-6">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
          <Star className="w-6 h-6 text-yellow-400 absolute top-0 right-1/4 animate-pulse" />
          <Star className="w-4 h-4 text-yellow-400 absolute bottom-2 left-1/4 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-emerald-800 mb-2">🎉 Parabéns!</h1>
        <p className="text-lg text-gray-700 mb-4">
          Você completou todos os <strong>20 níveis</strong>!
        </p>
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 mb-6 text-white">
          <p className="text-2xl font-bold">
            Pontuação Final: {totalScore}
          </p>
        </div>
        <Button 
          onClick={onCompleteGame}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-2xl shadow-lg"
        >
          Finalizar Jogo
        </Button>
      </div>
    </div>
  );
};

export default ChallengeCompletedScreen;
