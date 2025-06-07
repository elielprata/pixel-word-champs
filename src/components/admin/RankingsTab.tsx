
import React, { useState } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRankings } from '@/hooks/useRankings';
import { useCompetitions } from '@/hooks/useCompetitions';
import { rankingExportService } from '@/services/rankingExportService';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingTabs } from './rankings/RankingTabs';
import { RankingCard } from './rankings/RankingCard';
import { RankingInfoCard } from './rankings/RankingInfoCard';

export const RankingsTab = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily');
  const { 
    dailyRanking, 
    weeklyRanking, 
    totalPlayers, 
    isLoading, 
    refreshData 
  } = useRankings();
  
  const { competitions } = useCompetitions();

  const handleRefresh = async () => {
    await refreshData();
    toast({
      title: "Dados atualizados",
      description: "Rankings foram atualizados com sucesso.",
    });
  };

  const handleExport = async () => {
    try {
      if (activeTab === 'daily') {
        const data = await rankingExportService.exportDailyRankings();
        rankingExportService.exportToCSV(data, `ranking_diario_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const data = await rankingExportService.exportWeeklyRankings();
        rankingExportService.exportToCSV(data, `ranking_semanal_${new Date().toISOString().split('T')[0]}.csv`);
      }
      
      toast({
        title: "Exportação concluída",
        description: "Ranking exportado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o ranking.",
        variant: "destructive",
      });
    }
  };

  const currentRanking = activeTab === 'daily' ? dailyRanking : weeklyRanking;

  return (
    <div className="space-y-6">
      <RankingHeader
        totalPlayers={totalPlayers}
        activeCompetitions={competitions.length}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        canExport={currentRanking.length > 0}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <RankingTabs activeTab={activeTab} />

        <TabsContent value="daily" className="space-y-4 mt-0">
          <RankingCard
            title="Ranking Diário"
            description="Top jogadores de hoje"
            ranking={dailyRanking}
            isLoading={isLoading}
            badgeColor="from-blue-50 to-purple-50"
            avatarGradient="from-purple-400 to-blue-500"
            emptyMessage="Nenhum ranking disponível para hoje"
          />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-0">
          <RankingCard
            title="Ranking Semanal"
            description="Top jogadores desta semana"
            ranking={weeklyRanking}
            isLoading={isLoading}
            badgeColor="from-purple-50 to-indigo-50"
            avatarGradient="from-indigo-400 to-purple-500"
            emptyMessage="Nenhum ranking disponível para esta semana"
          />
        </TabsContent>
      </Tabs>

      <RankingInfoCard />
    </div>
  );
};
