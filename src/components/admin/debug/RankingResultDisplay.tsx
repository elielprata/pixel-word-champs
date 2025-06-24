
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface RankingResultDisplayProps {
  lastResult: any;
}

export const RankingResultDisplay = ({ lastResult }: RankingResultDisplayProps) => {
  if (!lastResult) return null;

  return (
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
  );
};
