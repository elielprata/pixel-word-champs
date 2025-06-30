
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Play } from "lucide-react";

interface FinalizationStatus {
  competitions_needing_finalization: number;
  competitions_details: Array<{
    id: string;
    title: string;
    end_date: string;
    days_overdue: number;
    needs_finalization: boolean;
  }>;
  checked_at: string;
}

export const WeeklyFinalizationMonitor = () => {
  const [status, setStatus] = useState<FinalizationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const checkFinalizationStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_weekly_competitions_status');
      
      if (error) throw error;
      
      setStatus(data);
      
      if (data.competitions_needing_finalization > 0) {
        toast({
          title: "Competições Pendentes",
          description: `${data.competitions_needing_finalization} competição(ões) precisam ser finalizadas`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status das competições",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeFinalization = async () => {
    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-competition-finalizer', {
        body: { manual_execution: true }
      });

      if (error) throw error;

      toast({
        title: "Finalização Executada",
        description: `${data.summary?.successful_finalizations || 0} competição(ões) finalizadas com sucesso`,
      });

      // Recarregar status após execução
      await checkFinalizationStatus();
    } catch (error) {
      console.error('Erro ao executar finalização:', error);
      toast({
        title: "Erro na Finalização",
        description: "Não foi possível executar a finalização automática",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    checkFinalizationStatus();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkFinalizationStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando status...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Monitor de Finalização Automática</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={checkFinalizationStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
          {status.competitions_needing_finalization > 0 && (
            <Button
              onClick={executeFinalization}
              disabled={isExecuting}
              variant="default"
              size="sm"
            >
              <Play className={`w-4 h-4 mr-2 ${isExecuting ? 'animate-spin' : ''}`} />
              Finalizar Agora
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Geral */}
        <div className="flex items-center gap-2">
          {status.competitions_needing_finalization === 0 ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">Todas as competições estão em dia</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">
                {status.competitions_needing_finalization} competição(ões) precisa(m) ser finalizada(s)
              </span>
            </>
          )}
        </div>

        {/* Detalhes das Competições Pendentes */}
        {status.competitions_details && status.competitions_details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Competições Pendentes:</h4>
            {status.competitions_details.map((comp) => (
              <div key={comp.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-sm">{comp.title || `Competição ${comp.id.slice(0, 8)}`}</div>
                  <div className="text-xs text-gray-600">
                    Fim: {new Date(comp.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Badge variant="destructive">
                  {comp.days_overdue} dia(s) atrasado
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div>Última verificação: {new Date(status.checked_at).toLocaleString('pt-BR')}</div>
          <div>Cron job configurado para: 23:59 diariamente</div>
          <div>Sistema de finalização automática: Ativo ✅</div>
        </div>
      </div>
    </Card>
  );
};

