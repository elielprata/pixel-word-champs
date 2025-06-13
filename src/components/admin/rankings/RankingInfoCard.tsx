
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, Clock, RefreshCw, Info } from 'lucide-react';
import { useRankings } from '@/hooks/admin/useRankings';
import { logger } from '@/utils/logger';

export const RankingInfoCard = () => {
  const { isLoading, refreshData } = useRankings();

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Informações do Ranking</p>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">Consulte as estatísticas</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Dados atualizados automaticamente</p>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 border-slate-200 hover:bg-slate-50"
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
