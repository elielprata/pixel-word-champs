
import React from 'react';

interface ChallengeErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onBackToMenu: () => void;
}

const ChallengeErrorDisplay = ({ error, onRetry, onBackToMenu }: ChallengeErrorDisplayProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-4">Ops! Algo deu errado</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={onBackToMenu}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-colors"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeErrorDisplay;
