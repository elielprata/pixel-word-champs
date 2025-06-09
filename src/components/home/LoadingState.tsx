
import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando competições...</p>
      </div>
    </div>
  );
};

export default LoadingState;
