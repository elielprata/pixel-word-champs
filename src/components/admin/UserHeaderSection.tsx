
import React from 'react';
import { Users } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

export const UserHeaderSection = () => {
  const { stats } = useRealUserStats();

  // Calcular métricas dinâmicas baseadas em dados reais
  const growthRate = stats.totalUsers > 0 && stats.newUsersToday > 0
    ? ((stats.newUsersToday / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  // Taxa de atividade: percentual de usuários ativos em relação ao total (máximo 100%)
  const activityRate = stats.totalUsers > 0 && stats.activeUsers > 0
    ? Math.min(((stats.activeUsers / stats.totalUsers) * 100), 100).toFixed(0)
    : '0';

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <p className="text-blue-100 mt-1">Administre usuários e suas permissões na plataforma</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Crescimento Diário</div>
                <div className="text-xl font-bold">
                  {stats.isLoading ? '...' : `+${growthRate}%`}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Taxa de Atividade</div>
                <div className="text-xl font-bold">
                  {stats.isLoading ? '...' : `${activityRate}%`}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Retenção D1</div>
                <div className="text-xl font-bold">
                  {stats.isLoading ? '...' : `${stats.retentionD1}%`}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Retenção D3</div>
                <div className="text-xl font-bold">
                  {stats.isLoading ? '...' : `${stats.retentionD3}%`}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Retenção D7</div>
                <div className="text-xl font-bold">
                  {stats.isLoading ? '...' : `${stats.retentionD7}%`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
