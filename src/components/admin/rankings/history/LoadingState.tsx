
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-slate-600 mt-4">Carregando histórico de competições...</p>
      </div>
    </div>
  );
};
