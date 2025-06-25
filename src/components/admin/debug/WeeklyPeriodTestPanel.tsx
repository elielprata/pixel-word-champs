
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { WeeklyPeriodService } from '@/services/weeklyPeriodService';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';
import { useToast } from '@/hooks/use-toast';

interface DbStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  top_3_players?: Array<{
    username: string;
    score: number;
    position: number;
    prize: number;
  }>;
}

export const WeeklyPeriodTestPanel = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);

  const runPeriodTest = async () => {
    setIsLoading(true);
    try {
      // Testar cálculo local
      const localPeriod = WeeklyPeriodService.calculateWeekPeriod({
        start_day_of_week: 0,
        duration_days: 7
      });
      
      // Obter estatísticas do banco
      const statsResponse = await WeeklyPeriodService.getWeeklyStats();
      const stats = statsResponse as DbStats;
      
      const results = {
        local: {
          start: localPeriod.start.toISOString().split('T')[0],
          end: localPeriod.end.toISOString().split('T')[0],
          startDay: localPeriod.start.toLocaleDateString('pt-BR', { weekday: 'long' }),
          endDay: localPeriod.end.toLocaleDateString('pt-BR', { weekday: 'long' })
        },
        database: {
          start: stats.current_week_start,
          end: stats.current_week_end,
          startDay: new Date(stats.current_week_start).toLocaleDateString('pt-BR', { weekday: 'long' }),
          endDay: new Date(stats.current_week_end).toLocaleDateString('pt-BR', { weekday: 'long' })
        },
        isConsistent: localPeriod.start.toISOString().split('T')[0] === stats.current_week_start &&
                     localPeriod.end.toISOString().split('T')[0] === stats.current_week_end
      };
      
      setTestResults(results);
      setDbStats(stats);
      
      if (results.isConsistent) {
        toast({
          title: "✅ Teste Passou!",
          description: "Cálculo local e do banco estão consistentes",
        });
      } else {
        toast({
          title: "❌ Inconsistência Detectada",
          description: "Cálculo local difere do banco de dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao executar teste de período semanal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceRankingUpdate = async () => {
    setIsLoading(true);
    try {
      await WeeklyPeriodService.updateWeeklyRanking();
      toast({
        title: "Ranking Atualizado",
        description: "Ranking semanal foi atualizado com sucesso",
      });
      // Re-executar teste após atualização
      await runPeriodTest();
    } catch (error) {
      toast({
        title: "Erro na Atualização",
        description: "Falha ao atualizar ranking semanal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Calendar className="h-5 w-5" />
          Teste de Período Semanal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runPeriodTest} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Clock className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testando...' : 'Executar Teste'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={forceRankingUpdate} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Ranking
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {testResults.isConsistent ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Consistente
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Inconsistente
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Cálculo Local</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Início:</span> {testResults.local.start} ({testResults.local.startDay})
                  </div>
                  <div>
                    <span className="text-gray-600">Fim:</span> {testResults.local.end} ({testResults.local.endDay})
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Banco de Dados</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Início:</span> {testResults.database.start} ({testResults.database.startDay})
                  </div>
                  <div>
                    <span className="text-gray-600">Fim:</span> {testResults.database.end} ({testResults.database.endDay})
                  </div>
                </div>
              </div>
            </div>

            {dbStats && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Estatísticas Adicionais</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Participantes:</span> {dbStats.total_participants}
                  </div>
                  <div>
                    <span className="text-gray-600">Pool de Prêmios:</span> R$ {dbStats.total_prize_pool}
                  </div>
                  <div>
                    <span className="text-gray-600">Última Atualização:</span> {formatBrasiliaDate(new Date(dbStats.last_update), false)}
                  </div>
                  <div>
                    <span className="text-gray-600">Top 3 Players:</span> {dbStats.top_3_players?.length || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          💡 Este painel testa se o cálculo de período semanal está consistente entre o código local e o banco de dados.
          Para domingo a sábado, deve mostrar o período correto (22/06 - 28/06).
        </div>
      </CardContent>
    </Card>
  );
};
