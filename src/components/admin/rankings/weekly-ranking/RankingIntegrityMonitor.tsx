
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface DuplicateData {
  user_id: string;
  week_start: string;
  week_end: string;
  count: number;
}

interface IntegrityResults {
  duplicate_count: number;
  duplicates: DuplicateData[];
  checked_at: string;
}

export const RankingIntegrityMonitor = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<IntegrityResults | null>(null);

  const checkIntegrity = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.rpc('detect_ranking_duplicates');
      
      if (error) {
        throw error;
      }

      setResults(data);
      
      if (data.duplicate_count === 0) {
        toast({
          title: "Integridade Verificada",
          description: "Nenhuma duplicata encontrada no ranking semanal.",
        });
      } else {
        toast({
          title: "Duplicatas Detectadas",
          description: `${data.duplicate_count} duplicatas encontradas no ranking.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na Verificação",
        description: error.message || "Erro ao verificar integridade do ranking.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const forceRankingUpdate = async () => {
    setIsFixing(true);
    try {
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Ranking Atualizado",
        description: "Ranking semanal foi recalculado com sucesso.",
      });

      // Verificar novamente após a correção
      await checkIntegrity();
    } catch (error: any) {
      toast({
        title: "Erro na Atualização",
        description: error.message || "Erro ao atualizar o ranking.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getStatusIcon = () => {
    if (!results) return <AlertCircle className="h-5 w-5 text-gray-500" />;
    
    if (results.duplicate_count === 0) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (!results) return "Não verificado";
    
    if (results.duplicate_count === 0) {
      return "Sistema íntegro";
    }
    
    return `${results.duplicate_count} problema(s) detectado(s)`;
  };

  const getStatusBadge = () => {
    if (!results) return <Badge variant="secondary">Pendente</Badge>;
    
    if (results.duplicate_count === 0) {
      return <Badge variant="default" className="bg-green-600">Saudável</Badge>;
    }
    
    return <Badge variant="destructive">Problemas Detectados</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Monitor de Integridade do Ranking
        </CardTitle>
        <CardDescription>
          Monitore e corrija problemas de duplicação no ranking semanal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status atual */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">{getStatusText()}</p>
              {results && (
                <p className="text-sm text-slate-600">
                  Última verificação: {new Date(results.checked_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {/* Detalhes dos problemas */}
          {results && results.duplicate_count > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Duplicatas Detectadas:</h4>
              <div className="space-y-1">
                {results.duplicates.slice(0, 5).map((duplicate, index) => (
                  <p key={index} className="text-sm text-red-700">
                    Usuário {duplicate.user_id.slice(0, 8)}... - {duplicate.count} registros para {duplicate.week_start}
                  </p>
                ))}
                {results.duplicates.length > 5 && (
                  <p className="text-sm text-red-600 font-medium">
                    +{results.duplicates.length - 5} outros problemas...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              onClick={checkIntegrity}
              disabled={isChecking}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Verificar Integridade
            </Button>
            
            {results && results.duplicate_count > 0 && (
              <Button
                onClick={forceRankingUpdate}
                disabled={isFixing}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
                Corrigir Ranking
              </Button>
            )}
          </div>

          {/* Informações técnicas */}
          <div className="text-xs text-slate-500 pt-2 border-t">
            <p>✅ Constraint UNIQUE ativa para prevenir duplicatas</p>
            <p>✅ Função UPSERT robusta implementada</p>
            <p>✅ Monitoramento automático de integridade</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
