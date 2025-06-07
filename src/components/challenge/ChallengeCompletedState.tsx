
import React from 'react';

interface ChallengeCompletedStateProps {
  onBack: () => void;
}

const ChallengeCompletedState = ({ onBack }: ChallengeCompletedStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Desafio Concluído</h2>
        <p className="text-gray-600 mb-6">Você já completou este desafio.</p>
        <button 
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default ChallengeCompletedState;
