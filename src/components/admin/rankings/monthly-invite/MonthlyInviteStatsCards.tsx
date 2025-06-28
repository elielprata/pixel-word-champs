
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Trophy, Calendar, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { monthlyInviteUnifiedService } from '@/services/monthlyInvite/monthlyInviteUnified';
import { useToast } from '@/hooks/use-toast';

interface MonthlyInviteStatsCardsProps {
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
    topPerformers?: any[];
  };
  rankings: any[];
  competition: {
    id?: string;
    status?: string;
    total_prize_pool?: number;
  } | null;
  onRefresh?: () => void;
}

export const MonthlyInviteStatsCards = ({ stats, rankings, competition, onRefresh }: MonthlyInviteStatsCardsProps) => {
  const { toast } = useToast();

  const handleRefreshData = async () => {
    try {
      const response = await monthlyInviteUnifiedService.refreshMonthlyRanking();
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

  const totalParticipants = stats?.totalParticipants || 0;
  const totalPrizePool = stats?.totalPrizePool || 0;
  const winnersCount = rankings?.filter((r: any) => r.prize_amount > 0).length || 0;
  const competitionStatus = competition?.status || 'inactive';

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
            {totalParticipants}
          </div>
          <div className="text-sm text-gray-600">Participantes</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            R$ {totalPrizePool.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Prêmios</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">
            {winnersCount}
          </div>
          <div className="text-sm text-gray-600">Ganhadores</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {competitionStatus === 'active' ? 'Ativa' : 
             competitionStatus === 'completed' ? 'Finalizada' : 
             competitionStatus === 'scheduled' ? 'Agendada' : 'Inativa'}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </CardContent>
      </Card>
    </div>
  );
};
