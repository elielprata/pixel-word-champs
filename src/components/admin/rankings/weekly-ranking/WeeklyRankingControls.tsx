
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Info, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';

interface WeeklyRankingControlsProps {
  onResetScores: () => void;
}

export const WeeklyRankingControls: React.FC<WeeklyRankingControlsProps> = ({
  onResetScores
}) => {
  const { stats } = useWeeklyRanking();

  const getResetDescription = () => {
    if (!stats?.config) return 'Carregando configuração...';
    
    const { config } = stats;
    
    if (config.custom_start_date && config.custom_end_date) {
      const endDate = new Date(config.custom_end_date);
      return `Resetará automaticamente após ${endDate.toLocaleDateString('pt-BR')} (período personalizado)`;
    }
    
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const startDay = dayNames[config.start_day_of_week];
    
    if (config.duration_days === 7) {
      return `Resetará automaticamente toda ${startDay} às 00:00h (início da semana)`;
    }
    
    return `Resetará automaticamente a cada ${config.duration_days} dias, iniciando às ${startDay}s`;
  };

  const getPeriodInfo = () => {
    if (!stats?.config) return 'Configuração padrão';
    
    const { config } = stats;
    
    if (config.custom_start_date && config.custom_end_date) {
      return 'Período Personalizado';
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const startDay = dayNames[config.start_day_of_week];
    const endDayIndex = (config.start_day_of_week + config.duration_days - 1) % 7;
    const endDay = dayNames[endDayIndex];
    
    if (config.duration_days === 7) {
      return `Semana ${startDay} - ${endDay}`;
    }
    
    return `Período ${startDay} - ${endDay} (${config.duration_days}d)`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card de Informações */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sistema de Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Período Atual</p>
              <p className="text-xs text-blue-600">{getPeriodInfo()}</p>
            </div>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Funcionamento:</strong> {getResetDescription()}
            </p>
          </div>
          
          <div className="text-xs text-blue-600 space-y-1">
            <p>• Pontuações são acumuladas durante o período ativo</p>
            <p>• Rankings são calculados automaticamente</p>
            <p>• Prêmios são distribuídos conforme configuração da aba Pagamentos</p>
          </div>
        </CardContent>
      </Card>

      {/* Card de Controles */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Controles Administrativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              <strong>Atenção:</strong> O reset manual afeta todos os usuários e não pode ser desfeito.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={onResetScores}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar Pontuações Manualmente
            </Button>
            
            <p className="text-xs text-gray-600 text-center">
              Use apenas em caso de necessidade. O sistema resetará automaticamente conforme configurado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
