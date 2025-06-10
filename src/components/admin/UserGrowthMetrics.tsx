
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useUserGrowth } from '@/hooks/useUserGrowth';

export const UserGrowthMetrics = () => {
  const { data: growthData, isLoading, error } = useUserGrowth();

  if (isLoading) {
    return (
      <div className="border-slate-200 shadow-lg bg-white rounded-lg">
        <div className="pb-3 p-4 border-b border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Crescimento de Usuários
          </h3>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-500">Carregando dados...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-slate-200 shadow-lg bg-white rounded-lg">
        <div className="pb-3 p-4 border-b border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-4 w-4 text-red-600" />
            Crescimento de Usuários
          </h3>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center">
            <p className="text-red-600">Erro ao carregar dados de crescimento</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const chartData = growthData?.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  })) || [];

  const totalGrowth = growthData && growthData.length > 1 
    ? growthData[growthData.length - 1].newUsers - growthData[0].newUsers
    : 0;

  return (
    <div className="border-slate-200 shadow-lg bg-white rounded-lg">
      <div className="pb-3 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Crescimento de Usuários
          </h3>
          <div className="text-right">
            <div className="text-sm text-slate-600">Últimos 7 dias</div>
            <div className={`text-lg font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGrowth >= 0 ? '+' : ''}{totalGrowth}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip 
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value, name) => [
                  value, 
                  name === 'newUsers' ? 'Novos Usuários' : 'Total de Usuários'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
