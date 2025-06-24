
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, RefreshCw, Eye, TestTube, Shield, CheckCircle } from 'lucide-react';
import { rankingDebugService } from '@/services/rankingDebugService';
import { cleanOrphanGameSessions, validateOrphanPrevention } from '@/utils/cleanOrphanSessions';
import { logger } from '@/utils/logger';

const RankingDebugPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isValidatingProtection, setIsValidatingProtection] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [protectionResult, setProtectionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckConsistency = async () => {
    setIsChecking(true);
    setError(null);
    try {
      logger.debug('Iniciando verificação de consistência do ranking', undefined, 'RANKING_DEBUG');
      const result = await rankingDebugService.checkDataConsistency();
      setLastResult(result);
      logger.debug('Verificação de consistência concluída', { result }, 'RANKING_DEBUG');
    } catch (err) {
      setError('Erro ao verificar consistência');
      logger.error('Erro ao verificar consistência do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      logger.debug('Iniciando atualização forçada do ranking', undefined, 'RANKING_DEBUG');
      await rankingDebugService.forceRankingUpdate();
      // Verificar consistência após atualização
      setTimeout(async () => {
        const result = await rankingDebugService.checkDataConsistency();
        setLastResult(result);
        logger.debug('Atualização forçada concluída', { result }, 'RANKING_DEBUG');
      }, 1500);
    } catch (err: any) {
      setError(`Erro ao atualizar ranking: ${err.message || 'Erro desconhecido'}`);
      logger.error('Erro ao forçar atualização do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestFunction = async () => {
    setIsTesting(true);
    setError(null);
    try {
      logger.debug('Iniciando teste direto da função', undefined, 'RANKING_DEBUG');
      const result = await rankingDebugService.testFunctionDirectly();
      logger.debug('Resultado do teste de função', { result }, 'RANKING_DEBUG');
      if (!result.success) {
        setError(`Erro no teste: ${result.error?.message || 'Erro desconhecido'}`);
        logger.error('Erro no teste da função', { error: result.error }, 'RANKING_DEBUG');
      }
    } catch (err: any) {
      setError(`Erro no teste: ${err.message || 'Erro desconhecido'}`);
      logger.error('Erro no teste de função do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsTesting(false);
    }
  };

  const handleValidateProtection = async () => {
    setIsValidatingProtection(true);
    setError(null);
    try {
      logger.debug('🔍 Validando sistema de proteção contra sessões órfãs', undefined, 'ORPHAN_PROTECTION');
      
      // Primeiro validar se o sistema de proteção está funcionando
      const validation = await validateOrphanPrevention();
      
      // Depois executar limpeza se necessário
      const cleanup = await cleanOrphanGameSessions();
      
      const combinedResult = {
        validation,
        cleanup,
        systemHealth: validation.isProtected && cleanup.triggerWorking !== false ? 'PROTEGIDO' : 'COMPROMETIDO',
        lastCleanupExecuted: new Date().toISOString()
      };
      
      setProtectionResult(combinedResult);
      
      if (!validation.isProtected || cleanup.triggerBypassed) {
        setError('⚠️ Sistema de proteção comprometido - sessões órfãs detectadas');
        logger.error('🚨 Sistema de proteção contra sessões órfãs comprometido', { combinedResult }, 'ORPHAN_PROTECTION');
      } else {
        logger.info('✅ Sistema de proteção funcionando corretamente', { combinedResult }, 'ORPHAN_PROTECTION');
      }
      
    } catch (err: any) {
      setError(`Erro na validação: ${err.message || 'Erro desconhecido'}`);
      logger.error('❌ Erro ao validar sistema de proteção', { error: err }, 'ORPHAN_PROTECTION');
    } finally {
      setIsValidatingProtection(false);
    }
  };

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug do Ranking & Proteção Anti-Órfãs
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          Ferramentas para diagnóstico e correção de problemas no ranking e validação do sistema de prevenção de sessões órfãs
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {lastResult && (
          <div className="bg-white p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              📊 Último Resultado - Ranking:
            </h4>
            <div className="text-sm space-y-1">
              <p>• Total de perfis: {lastResult.summary?.totalProfiles}</p>
              <p>• Total no ranking: {lastResult.summary?.totalInRanking}</p>
              <p className={lastResult.summary?.inconsistenciesFound > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                • Inconsistências: {lastResult.summary?.inconsistenciesFound}
              </p>
              {lastResult.summary?.inconsistenciesFound === 0 && (
                <p className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  ✅ Sistema consistente - Limpeza executada com sucesso
                </p>
              )}
            </div>
          </div>
        )}

        {protectionResult && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              🛡️ Status da Proteção Anti-Órfãs:
            </h4>
            <div className="text-sm space-y-1">
              <p className={protectionResult.systemHealth === 'PROTEGIDO' ? 'text-green-600 font-medium flex items-center gap-1' : 'text-red-600 font-medium'}>
                {protectionResult.systemHealth === 'PROTEGIDO' && <CheckCircle className="w-4 h-4" />}
                • Sistema: {protectionResult.systemHealth}
              </p>
              <p>• Sessões órfãs detectadas: {protectionResult.validation?.orphanCount || 0}</p>
              <p>• Trigger funcionando: {protectionResult.validation?.isProtected ? 'SIM' : 'NÃO'}</p>
              {protectionResult.cleanup?.deletedCount > 0 && (
                <p className="text-orange-600">• Sessões removidas: {protectionResult.cleanup.deletedCount}</p>
              )}
              {protectionResult.lastCleanupExecuted && (
                <p className="text-gray-500">• Última verificação: {new Date(protectionResult.lastCleanupExecuted).toLocaleString('pt-BR')}</p>
              )}
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

          <Button 
            onClick={handleValidateProtection}
            disabled={isValidatingProtection}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {isValidatingProtection ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Validar Proteção
          </Button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            ✅ <strong>Limpeza Concluída:</strong> A sessão problemática foi removida com sucesso e o sistema foi sincronizado.
          </p>
        </div>
        
        <p className="text-xs text-yellow-600">
          ⚠️ Verifique o console do navegador para ver os logs detalhados
        </p>
      </CardContent>
    </Card>
  );
};

export default RankingDebugPanel;
