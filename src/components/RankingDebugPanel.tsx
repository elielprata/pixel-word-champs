
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, RefreshCw, Eye, TestTube } from 'lucide-react';
import { rankingDebugService } from '@/services/rankingDebugService';

const RankingDebugPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleCheckConsistency = async () => {
    setIsChecking(true);
    try {
      const result = await rankingDebugService.checkDataConsistency();
      setLastResult(result);
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      await rankingDebugService.forceRankingUpdate();
      // Verificar consistência após atualização
      setTimeout(async () => {
        const result = await rankingDebugService.checkDataConsistency();
        setLastResult(result);
      }, 1500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestFunction = async () => {
    setIsTesting(true);
    try {
      const result = await rankingDebugService.testFunctionDirectly();
      console.log('🧪 Resultado do teste:', result);
    } finally {
      setIsTesting(false);
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
      
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          Ferramentas para diagnóstico e correção de problemas no ranking
        </p>
        
        {lastResult && (
          <div className="bg-white p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">📊 Último Resultado:</h4>
            <div className="text-sm space-y-1">
              <p>• Total de perfis: {lastResult.summary?.totalProfiles}</p>
              <p>• Total no ranking: {lastResult.summary?.totalInRanking}</p>
              <p className={lastResult.summary?.inconsistenciesFound > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                • Inconsistências: {lastResult.summary?.inconsistenciesFound}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
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

          <Button 
            onClick={handleTestFunction}
            disabled={isTesting}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <TestTube className="w-4 h-4 mr-2" />
            )}
            Testar Função
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
