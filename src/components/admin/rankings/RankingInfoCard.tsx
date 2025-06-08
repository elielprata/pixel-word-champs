
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, DollarSign, Settings, Eye, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { rankingExportService } from '@/services/rankingExportService';
import { useRankings } from '@/hooks/useRankings';

interface RankingInfoCardProps {
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  status: 'active' | 'inactive';
  lastUpdate: string;
}

export const RankingInfoCard = ({ 
  type, 
  title, 
  description, 
  status, 
  lastUpdate 
}: RankingInfoCardProps) => {
  const { toast } = useToast();
  const { totalDailyPlayers, totalWeeklyPlayers, refreshData } = useRankings();
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isDaily = type === 'daily';
  const iconColor = isDaily ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600';
  const statusColor = status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200';
  const participants = isDaily ? totalDailyPlayers : totalWeeklyPlayers;
  const prizePool = isDaily ? 0 : Math.min(totalWeeklyPlayers * 10, 2500);

  const handleView = () => {
    toast({
      title: "Visualizar Ranking",
      description: `Abrindo detalhes do ranking ${isDaily ? 'diário' : 'semanal'}...`,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast({
        title: "Dados atualizados",
        description: "Rankings atualizados com dados do banco de dados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data;
      let filename;
      
      if (isDaily) {
        data = await rankingExportService.exportDailyRankings();
        filename = `ranking_diario_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        data = await rankingExportService.exportWeeklyRankings();
        filename = `ranking_semanal_${new Date().toISOString().split('T')[0]}.csv`;
      }

      if (data.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há dados de ranking para exportar.",
          variant: "destructive",
        });
        return;
      }

      rankingExportService.exportToCSV(data, filename);
      
      toast({
        title: "Exportação concluída",
        description: `${data.length} registros exportados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao exportar ranking:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados do ranking.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfig = () => {
    toast({
      title: "Configurações",
      description: `Abrindo configurações do ranking ${isDaily ? 'diário' : 'semanal'}...`,
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-r ${iconColor} p-2.5 rounded-lg shadow-sm`}>
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </div>
          </div>
          <Badge className={statusColor}>
            {status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Participantes</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{participants.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-500">Dados reais</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {isDaily ? (
                <>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Sistema</span>
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Prêmio</span>
                </>
              )}
            </div>
            {isDaily ? (
              <div>
                <p className="text-lg font-bold text-blue-600">Diário</p>
                <p className="text-xs text-slate-500">Sem premiação</p>
              </div>
            ) : (
              <div>
                <p className="text-xl font-bold text-slate-900">R$ {prizePool.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-slate-500">Calculado automaticamente</p>
              </div>
            )}
          </div>
        </div>

        {/* Informação específica do tipo */}
        {isDaily ? (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Sistema Diário</p>
                <p className="text-blue-700">Rankings baseados nos dados reais de pontuação dos usuários, atualizados automaticamente.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Trophy className="h-4 w-4 text-purple-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-800 mb-1">Sistema Semanal</p>
                <p className="text-purple-700">Dados sincronizados com o banco, premiação calculada automaticamente baseada na participação.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>Atualizado: {lastUpdate}</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={handleView}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-1" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
