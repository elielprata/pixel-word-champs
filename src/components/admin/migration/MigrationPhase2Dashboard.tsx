
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, 
  Link, 
  TrendingUp, 
  Plus,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { IndependentDailyCompetitionForm } from './IndependentDailyCompetitionForm';
import { independentCompetitionService } from '@/services/independentCompetitionService';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

export const MigrationPhase2Dashboard = () => {
  const { toast } = useToast();
  const [independentCompetitions, setIndependentCompetitions] = useState([]);
  const [legacyCompetitions, setLegacyCompetitions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [independentRes, legacyRes] = await Promise.all([
        independentCompetitionService.getIndependentCompetitions(),
        independentCompetitionService.getLegacyLinkedCompetitions()
      ]);

      if (independentRes.success) {
        setIndependentCompetitions(independentRes.data);
      }
      if (legacyRes.success) {
        setLegacyCompetitions(legacyRes.data);
      }

      secureLogger.info('Dados da Fase 2 carregados', {
        independent: independentRes.data?.length || 0,
        legacy: legacyRes.data?.length || 0
      }, 'MIGRATION_PHASE2');

    } catch (error) {
      secureLogger.error('Erro ao carregar dados da Fase 2', { error }, 'MIGRATION_PHASE2');
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da migração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompetitionCreated = () => {
    setIsFormOpen(false);
    loadData();
    toast({
      title: "✅ Competição Criada",
      description: "Nova competição independente criada com sucesso",
    });
  };

  const migrationProgress = {
    total: independentCompetitions.length + legacyCompetitions.length,
    migrated: independentCompetitions.length,
    percentage: independentCompetitions.length + legacyCompetitions.length > 0 
      ? (independentCompetitions.length / (independentCompetitions.length + legacyCompetitions.length)) * 100 
      : 0
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mr-2" />
            <span>Carregando dados da Fase 2...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Fase 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Fase 2: Migração Gradual - Sistema Independente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Implementação do novo sistema independente para competições diárias
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✅ Sistema Independente Ativo
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  🔄 Compatibilidade Mantida
                </Badge>
              </div>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Competição Independente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Competição Diária Independente</DialogTitle>
                </DialogHeader>
                <IndependentDailyCompetitionForm
                  onClose={() => setIsFormOpen(false)}
                  onSuccess={handleCompetitionCreated}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Migração */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Progresso da Migração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Competições Migradas</span>
              <span className="text-sm text-gray-600">
                {migrationProgress.migrated} de {migrationProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${migrationProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {migrationProgress.percentage.toFixed(1)}% das competições já funcionam independentemente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Sistemas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema Independente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Sistema Independente
              <Badge className="bg-green-100 text-green-800">Novo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {independentCompetitions.length}
                </span>
                <span className="text-sm text-gray-600">Competições Ativas</span>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg space-y-2">
                <h4 className="font-medium text-green-800">Vantagens:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Criação mais rápida e simples</li>
                  <li>✅ Funcionamento totalmente independente</li>
                  <li>✅ Pontuação direta no ranking semanal</li>
                  <li>✅ Sem dependências de torneios semanais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema Legado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Link className="h-5 w-5" />
              Sistema com Vinculação
              <Badge className="bg-orange-100 text-orange-800">Legado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {legacyCompetitions.length}
                </span>
                <span className="text-sm text-gray-600">Competições Vinculadas</span>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                <h4 className="font-medium text-orange-800">Limitações:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>⚠️ Requer torneio semanal ativo</li>
                  <li>⚠️ Processo de criação mais complexo</li>
                  <li>⚠️ Dependência de sistema externo</li>
                  <li>⚠️ Maior risco de falhas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Próximos Passos da Fase 2</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Sistema independente implementado e funcional</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Criar mais competições independentes para testar</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Monitorar performance e estabilidade</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Preparar Fase 3 (Limpeza Final)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
