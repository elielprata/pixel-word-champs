
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useInviteVerification } from '@/hooks/useInviteVerification';
import { Users, Gift, Zap, Activity, RefreshCw, Settings, AlertCircle } from 'lucide-react';

export const InviteDashboard = () => {
  const { toast } = useToast();
  const { isVerifying, triggerManualVerification, getInviteSystemStats } = useInviteVerification();
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const result = await getInviteSystemStats();
      if (result.success) {
        setStats(result.stats);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar estatísticas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleManualVerification = async () => {
    const result = await triggerManualVerification();
    if (result.success) {
      loadStats(); // Recarregar estatísticas após verificação
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard de Indicações</h2>
          <p className="text-slate-600">Gerencie o sistema de convites e recompensas</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadStats}
            disabled={isLoadingStats}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleManualVerification}
            disabled={isVerifying}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Zap className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verificando...' : 'Verificar Convites'}
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Total de Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalRewards || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Todas as recompensas criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recompensas Parciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.partialRewards || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">5 XP cada (aguardando ativação)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Recompensas Processadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.processedRewards || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">50 XP cada (completamente ativas)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.uniqueActiveUsers || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Com pelo menos 1 dia de atividade</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sistema de Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Recompensa Imediata</p>
                  <p className="text-sm text-blue-700">Quando alguém usa um código</p>
                </div>
                <Badge className="bg-blue-600">5 XP</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Recompensa Completa</p>
                  <p className="text-sm text-green-700">Após 5 dias de atividade</p>
                </div>
                <Badge className="bg-green-600">50 XP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dias de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-slate-900">
                {stats?.totalActivityDays || 0}
              </div>
              <p className="text-slate-600">
                Total de registros de atividade diária de todos os usuários
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Usuários precisam de 5 dias únicos de atividade para ativar recompensas completas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Ações Administrativas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Administrativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleManualVerification}
              disabled={isVerifying}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Verificar Convites Manualmente
            </Button>
            
            <Button
              onClick={loadStats}
              disabled={isLoadingStats}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Estatísticas
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast({
                  title: "Em Desenvolvimento",
                  description: "Relatório detalhado em breve.",
                });
              }}
            >
              <Gift className="h-4 w-4 mr-2" />
              Relatório Detalhado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
