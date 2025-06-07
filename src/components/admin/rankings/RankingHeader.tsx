
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Download, Users, TrendingUp, Calendar } from 'lucide-react';

interface RankingHeaderProps {
  totalPlayers: number;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
  canExport: boolean;
}

export const RankingHeader = ({ 
  totalPlayers, 
  isLoading, 
  onRefresh, 
  onExport, 
  canExport 
}: RankingHeaderProps) => {
  const activeCompetitions = 1; // Can be made dynamic later

  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Rankings Globais</h1>
                <p className="text-blue-100 mt-1">Acompanhe o desempenho dos jogadores em tempo real</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onExport}
              disabled={isLoading || !canExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Jogadores Ativos</span>
            </div>
            <div className="text-2xl font-bold">{totalPlayers.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Com pontuação</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Competições</span>
            </div>
            <div className="text-2xl font-bold">{activeCompetitions}</div>
            <div className="text-sm text-blue-100">Ativas esta semana</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Última Atualização</span>
            </div>
            <div className="text-2xl font-bold">Agora</div>
            <div className="text-sm text-blue-100">Dados em tempo real</div>
          </div>
        </div>
      </div>
    </div>
  );
};
