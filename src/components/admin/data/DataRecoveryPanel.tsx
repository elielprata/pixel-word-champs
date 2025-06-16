
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  History,
  Users,
  RotateCcw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { orphanedDataRecoveryService } from '@/services/orphanedDataRecoveryService';

export const DataRecoveryPanel = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [isResettingScores, setIsResettingScores] = useState(false);
  const { toast } = useToast();

  const handleRecoverOrphanedData = async () => {
    setIsRecovering(true);
    
    try {
      await orphanedDataRecoveryService.recoverOrphanedCompetitions();
      
      toast({
        title: "Recuperação Concluída",
        description: "Dados orfãos foram recuperados e salvos no histórico de competições.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro na recuperação:', error);
      toast({
        title: "Erro na Recuperação",
        description: "Não foi possível recuperar todos os dados. Verifique os logs para mais detalhes.",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleResetUserScores = async () => {
    const confirmReset = window.confirm(
      "⚠️ ATENÇÃO: Esta ação irá zerar a pontuação de TODOS os usuários que ainda possuem pontos. " +
      "Isso deve ser feito apenas se as competições foram finalizadas mas as pontuações não foram resetadas. " +
      "\n\nTem certeza que deseja continuar?"
    );

    if (!confirmReset) return;

    setIsResettingScores(true);
    
    try {
      await orphanedDataRecoveryService.forceResetUserScores();
      
      toast({
        title: "Reset Concluído",
        description: "Pontuações dos usuários foram zeradas com sucesso.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro no reset:', error);
      toast({
        title: "Erro no Reset",
        description: "Não foi possível resetar todas as pontuações. Verifique os logs para mais detalhes.",
        variant: "destructive"
      });
    } finally {
      setIsResettingScores(false);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-200">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Recuperação de Dados
        </CardTitle>
        <p className="text-sm text-slate-600">
          Ferramentas para recuperar dados de competições e corrigir inconsistências
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Alert de Aviso */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Atenção:</strong> Use estas ferramentas apenas quando necessário. 
            Elas são para corrigir problemas no processo de finalização das competições.
          </AlertDescription>
        </Alert>

        {/* Seção de Recuperação de Dados Orfãos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Recuperação de Dados Orfãos</h3>
          </div>

          <p className="text-sm text-slate-600">
            Identifica competições finalizadas que não tiveram seus dados salvos corretamente 
            no histórico e recria as informações baseadas nas participações existentes.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">O que esta ferramenta faz:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Busca competições com status "completed" sem histórico salvo</li>
              <li>• Reconstrói participações baseadas na tabela competition_participations</li>
              <li>• Calcula prêmios dinamicamente conforme configurações atuais</li>
              <li>• Salva dados no competition_history para preservar informações</li>
              <li>• Atualiza prêmios nas participações existentes</li>
            </ul>
          </div>

          <Button
            onClick={handleRecoverOrphanedData}
            disabled={isRecovering}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recuperando Dados...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Recuperar Dados Orfãos
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Seção de Reset de Pontuações */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-slate-800">Reset de Pontuações</h3>
            <Badge variant="destructive" className="text-xs">CUIDADO</Badge>
          </div>

          <p className="text-sm text-slate-600">
            Zera a pontuação de todos os usuários que ainda possuem pontos. 
            Use apenas se as competições foram finalizadas mas as pontuações não foram resetadas.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">⚠️ ATENÇÃO - Esta ação é irreversível:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Zera a pontuação (total_score) de TODOS os usuários</li>
              <li>• Prepara usuários para participar de novas competições</li>
              <li>• Deve ser usado apenas após salvar dados no histórico</li>
              <li>• NÃO afeta histórico já salvo de competições anteriores</li>
            </ul>
          </div>

          <Button
            onClick={handleResetUserScores}
            disabled={isResettingScores}
            variant="destructive"
            className="w-full"
          >
            {isResettingScores ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resetando Pontuações...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Resetar Pontuações dos Usuários
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Processo Recomendado */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800">Processo Recomendado</h3>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Para corrigir dados de competições passadas:</h4>
            <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside">
              <li><strong>Primeiro:</strong> Execute "Recuperar Dados Orfãos" para salvar histórico das competições</li>
              <li><strong>Depois:</strong> Execute "Resetar Pontuações" para zerar scores e preparar nova competição</li>
              <li><strong>Monitore:</strong> Verifique os logs no console para acompanhar o processo</li>
              <li><strong>Verifique:</strong> Confirme que o histórico foi salvo antes de resetar pontuações</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
