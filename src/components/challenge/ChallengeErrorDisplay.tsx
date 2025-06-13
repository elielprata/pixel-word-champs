
import React from 'react';
import { Button } from '@/components/ui/button';

interface ChallengeErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onBackToMenu: () => void;
}

const ChallengeErrorDisplay = ({ error, onRetry, onBackToMenu }: ChallengeErrorDisplayProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 flex items-center justify-center">
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto border border-white/30">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-red-800 mb-4">Ops! Algo deu errado</h1>
        <p className="text-gray-700 mb-6 text-sm leading-relaxed">{error}</p>
        <div className="space-y-3">
          <Button 
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg"
          >
            Tentar Novamente
          </Button>
          <Button 
            variant="outline"
            onClick={onBackToMenu}
            className="w-full border-2 border-gray-300 hover:bg-gray-50 font-bold py-3 rounded-2xl"
          >
            Voltar ao Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeErrorDisplay;
