import React from 'react';
import { Trophy, TrendingUp, Users, Calendar, Award, Crown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
export const RankingHeader = () => {
  return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg shadow-md">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sistema de Competições</h1>
            <p className="text-slate-600 mt-1 text-sm">
              Gerencie rankings diários, semanais e acompanhe premiações
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
            <Award className="h-3 w-3 mr-1" />
            Premiações Automáticas
          </Badge>
        </div>
      </div>
    </div>;
};