
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import { MonthlyInviteHeader } from './monthly-invite/MonthlyInviteHeader';
import { MonthlyInviteStatsCards } from './monthly-invite/MonthlyInviteStatsCards';
import { MonthlyInviteRankingTable } from './monthly-invite/MonthlyInviteRankingTable';

export const MonthlyInviteTab = () => {
  const { data, refreshRanking } = useMonthlyInviteCompetition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefreshRanking = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshRanking();
      if (result?.success) {
        toast({
          title: "Ranking Atualizado",
          description: "O ranking mensal foi atualizado com sucesso.",
        });
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o ranking.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportWinners = () => {
    if (!data?.rankings || data.rankings.length === 0) {
      toast({
        title: "Nenhum Dado",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const winners = data.rankings.filter((r: any) => r.prize_amount > 0);
    const csvContent = [
      ['Posição', 'Usuário', 'Pontos', 'Convites', 'Prêmio', 'Status', 'Chave PIX', 'Nome PIX'],
      ...winners.map((winner: any) => [
        winner.position,
        winner.username,
        winner.invite_points,
        winner.invites_count,
        `R$ ${winner.prize_amount}`,
        winner.payment_status,
        winner.pix_key || '',
        winner.pix_holder_name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking-mensal-indicacoes-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação Concluída",
      description: "Lista de ganhadores exportada com sucesso.",
    });
  };

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Erro ao carregar dados</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const { competition, rankings, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <MonthlyInviteHeader
        currentMonth={currentMonth}
        isRefreshing={isRefreshing}
        onRefreshRanking={handleRefreshRanking}
        onExportWinners={exportWinners}
      />

      <MonthlyInviteStatsCards
        stats={stats}
        rankings={rankings}
        competition={competition}
      />

      <MonthlyInviteRankingTable rankings={rankings} />
    </div>
  );
};
