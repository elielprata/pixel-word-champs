
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, RefreshCw, Eye } from 'lucide-react';
import { rankingDebugService } from '@/services/rankingDebugService';

const RankingDebugPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckConsistency = async () => {
    setIsChecking(true);
    try {
      await rankingDebugService.checkDataConsistency();
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      await rankingDebugService.forceRankingUpdate();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug do Ranking
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-yellow-700">
          Ferramentas para diagnóstico de problemas no ranking
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleCheckConsistency}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Verificar Consistência
          </Button>
          
          <Button 
            onClick={handleForceUpdate}
            disabled={isUpdating}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Forçar Atualização
          </Button>
        </div>
        
        <p className="text-xs text-yellow-600">
          ⚠️ Verifique o console do navegador para ver os logs detalhados
        </p>
      </CardContent>
    </Card>
  );
};

export default RankingDebugPanel;
