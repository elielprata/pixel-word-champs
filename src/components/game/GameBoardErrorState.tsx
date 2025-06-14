
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProcessingMetrics {
  totalWords: number;
  validWords: number;
  processingTime: number;
  cacheHit: boolean;
}

interface GameBoardErrorStateProps {
  error: string;
  debugInfo?: string;
  metrics?: ProcessingMetrics | null;
}

const GameBoardErrorState = ({ error, debugInfo, metrics }: GameBoardErrorStateProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p><strong>Erro ao carregar o jogo:</strong></p>
          <p className="text-sm">{error}</p>
          {debugInfo && (
            <p className="text-xs opacity-75">Debug: {debugInfo}</p>
          )}
          {metrics && (
            <p className="text-xs opacity-75 mt-1">
              Métricas: {metrics.totalWords} palavras • {Math.round(metrics.processingTime)}ms
            </p>
          )}
          <Button 
            onClick={() => window.location.reload()} 
            size="sm" 
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default GameBoardErrorState;
