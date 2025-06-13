
import React from 'react';

const DailyChallengeLoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Preparando sua competição...</p>
        <p className="text-gray-500 text-sm mt-2">Carregando tabuleiro e palavras</p>
      </div>
    </div>
  );
};

export default DailyChallengeLoadingScreen;
