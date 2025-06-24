
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, AlertTriangle } from 'lucide-react';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';

interface WeeklyRankingControlsProps {
  onResetScores: () => void;
}

export const WeeklyRankingControls = ({ onResetScores }: WeeklyRankingControlsProps) => {
  const { stats } = useWeeklyRanking();
  const [showConfigModal, setShowConfigModal] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getWeekConfigInfo = () => {
    if (!stats?.config) {
      return "Configuração padrão (Domingo a Sábado)";
    }
    
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const startDay = dayNames[stats.config.start_day_of_week] || 'Domingo';
    return `${startDay} - ${stats.config.duration_days} dias`;
  };

  const getCustomPeriodInfo = () => {
    if (!stats?.config?.custom_start_date || !stats?.config?.custom_end_date) {
      return null;
    }
    
    return {
      start: formatDate(stats.config.custom_start_date),
      end: formatDate(stats.config.custom_end_date)
    };
  };

  const customPeriod = getCustomPeriodInfo();

  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            Configuração do Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Período da Semana</label>
              <p className="text-sm text-slate-800">{getWeekConfigInfo()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Período Atual</label>
              <p className="text-sm text-slate-800">
                {stats ? `${formatDate(stats.current_week_start)} - ${formatDate(stats.current_week_end)}` : 'Carregando...'}
              </p>
            </div>
          </div>

          {customPeriod && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Período Personalizado Ativo</p>
                  <p className="text-sm text-blue-600">
                    {customPeriod.start} até {customPeriod.end}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurar Período
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Ação */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-600" />
            Controles de Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Ação Irreversível</p>
                <p>O reset das pontuações irá zerar todos os scores e posições da semana atual.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onResetScores}
            variant="destructive"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar Pontuações Semanais
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      <WeeklyConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigUpdated={() => {
          setShowConfigModal(false);
          // Trigger refetch if needed
        }}
      />
    </div>
  );
};
