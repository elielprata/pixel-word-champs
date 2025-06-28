
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Trophy, Calendar, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useMonthlyInvitePrizes } from '@/hooks/useMonthlyInvitePrizes';
import { monthlyInviteService } from '@/services/monthlyInvite';
import { useToast } from '@/hooks/use-toast';

interface MonthlyInviteStatsCardsProps {
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
  };
  rankings: any[];
  competition: {
    id?: string;
    status?: string;
  };
  onRefresh?: () => void;
}

export const MonthlyInviteStatsCards = ({ stats, rankings, competition, onRefresh }: MonthlyInviteStatsCardsProps) => {
  const { databasePrizePool, calculateTotalPrizePool, forceRecalculation, isLoading } = useMonthlyInvitePrizes(competition?.id);
  const { toast } = useToast();
  
  // Verificar se há dessincronização
  const calculatedTotal = calculateTotalPrizePool();
  const isDesynchronized = Math.abs(databasePrizePool - calculatedTotal) > 0.01;

  const handleSyncPrizes = async () => {
    await forceRecalculation();
  };

  const handleRefreshData = async () => {
    try {
      const response = await monthlyInviteService.refreshMonthlyRanking();
      if (response.success) {
        toast({
          title: "Dados atualizados",
          description: "Participantes e ranking foram recalculados com base nos convites reais.",
        });
        onRefresh?.();
      } else {
        throw new Error(response.error || 'Erro ao atualizar dados');
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <Button
              onClick={handleRefreshData}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              title="Atualizar dados dos participantes"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalParticipants}
          </div>
          <div className="text-sm text-gray-600">Participantes</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            {isDesynchronized && (
              <Button
                onClick={handleSyncPrizes}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={isLoading}
                title="Sincronizar valores"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <div className="text-2xl font-bold text-green-600">
            R$ {databasePrizePool.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            Total Prêmios
            {isDesynchronized && (
              <span className="text-amber-600 block text-xs">
                (Calculado: R$ {calculatedTotal.toFixed(2)})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">
            {rankings.filter((r: any) => r.prize_amount > 0).length}
          </div>
          <div className="text-sm text-gray-600">Ganhadores</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {competition?.status === 'active' ? 'Ativa' : 'Finalizada'}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </CardContent>
      </Card>
    </div>
  );
};
