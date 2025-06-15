
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface WordSelectionErrorProps {
  error: string;
  level: number;
  processingTime: number;
  onRetry?: () => void;
}

const WordSelectionError = ({ error, level, processingTime, onRetry }: WordSelectionErrorProps) => {
  const handleReportToAdmin = () => {
    logger.security('🚨 Usuário reportou erro crítico de seleção de palavras', {
      error,
      level,
      processingTime,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      needsAdminAttention: true
    }, 'ADMIN_REPORT');

    // TODO: Implementar envio real para admin via API
    alert('Erro reportado para os administradores. Obrigado!');
  };

  return (
    <Alert variant="destructive" className="mx-4 my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">Erro ao carregar o jogo (Nível {level})</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs opacity-75 mt-1">
              Tempo de processamento: {processingTime}ms
            </p>
          </div>
          
          <div className="flex gap-2">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                size="sm" 
                variant="outline"
              >
                Tentar Novamente
              </Button>
            )}
            
            <Button 
              onClick={handleReportToAdmin}
              size="sm" 
              variant="destructive"
              className="flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              Reportar aos Admins
            </Button>
          </div>
          
          <div className="text-xs opacity-75 border-t pt-2">
            <p>Este erro indica um problema no servidor de palavras.</p>
            <p>Para competições justas, não utilizamos palavras alternativas.</p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default WordSelectionError;
