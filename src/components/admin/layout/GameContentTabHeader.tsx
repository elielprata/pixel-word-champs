
import React from 'react';
import { BookOpen } from 'lucide-react';

export const GameContentTabHeader = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg shadow-md">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestão de Conteúdo
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Central de controle para palavras e configurações do jogo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
