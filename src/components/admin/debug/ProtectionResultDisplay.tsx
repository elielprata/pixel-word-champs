
import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface ProtectionResultDisplayProps {
  protectionResult: any;
}

export const ProtectionResultDisplay = ({ protectionResult }: ProtectionResultDisplayProps) => {
  if (!protectionResult) return null;

  return (
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
  );
};
