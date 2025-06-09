
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { BookOpen, Crown } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
        </div>
      </div>
    </div>
  );
};
