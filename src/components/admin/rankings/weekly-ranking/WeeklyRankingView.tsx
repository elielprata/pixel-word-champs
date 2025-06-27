
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  DollarSign, 
  Trophy, 
  Users, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { PrizeConfigModal } from '../PrizeConfigModal';
import { WeeklyRankingModal } from '../WeeklyRankingModal';
import { useOptimizedCompetitions } from '@/hooks/useOptimizedCompetitions';
import { AdminErrorBoundary } from '../../AdminErrorBoundary';

export const WeeklyRankingView = () => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [configUpdated, setConfigUpdated] = useState(0);

  const { weeklyCompetition, isLoading, error, refetch } = useOptimizedCompetitions();

  console.log('WeeklyRankingView renderizando:', {
    hasWeeklyCompetition: !!weeklyCompetition,
    competitionStatus: weeklyCompetition?.status,
    isLoading,
    error
  });

  const handleConfigUpdated = () => {
    console.log('Configuração atualizada, recarregando dados...');
    setConfigUpdated(prev => prev + 1);
    refetch();
  };

  const handleOpenRanking = () => {
    if (weeklyCompetition) {
      console.log('Abrindo ranking da competição:', weeklyCompetition.id);
      setRankingModalOpen(true);
    }
  };

  if (error) {
    return (
      <AdminErrorBoundary>
        <Card className="border-red-200">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Erro ao Carregar</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </AdminErrorBoundary>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ranking Semanal</h2>
            <p className="text-sm text-slate-600">
              Gerencie competições semanais e configurações de premiação
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                console.log('Abrindo modal de configuração...');
                setConfigModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Competição
            </Button>
            
            <Button
              onClick={() => {
                console.log('Abrindo modal de premiação...');
                setPrizeModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-50"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Configurar Premiação
            </Button>
          </div>
        </div>

        {/* Competition Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Status da Competição Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-slate-600 text-sm">Carregando...</p>
              </div>
            ) : weeklyCompetition ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{weeklyCompetition.title}</h3>
                    <p className="text-sm text-slate-600">{weeklyCompetition.description}</p>
                  </div>
                  <Badge 
                    className={
                      weeklyCompetition.status === 'active' 
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }
                  >
                    {weeklyCompetition.status === 'active' ? 'Ativa' : 'Agendada'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      {new Date(weeklyCompetition.start_date).toLocaleDateString('pt-BR')} - 
                      {new Date(weeklyCompetition.end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      Max: {weeklyCompetition.max_participants || 'Ilimitado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      R$ {Number(weeklyCompetition.prize_pool || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {weeklyCompetition.status === 'active' && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleOpenRanking}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Ver Ranking Atual
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium mb-2">Nenhuma competição semanal ativa</p>
                <p className="text-sm mb-4">Configure uma nova competição semanal para começar.</p>
                <Button 
                  onClick={() => setConfigModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Competição
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <WeeklyConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onConfigUpdated={handleConfigUpdated}
        />

        <PrizeConfigModal
          open={prizeModalOpen}
          onOpenChange={setPrizeModalOpen}
        />

        {weeklyCompetition && (
          <WeeklyRankingModal
            open={rankingModalOpen}
            onOpenChange={setRankingModalOpen}
            competitionId={weeklyCompetition.id}
          />
        )}
      </div>
    </AdminErrorBoundary>
  );
};
