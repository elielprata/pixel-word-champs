
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  day: string;
  sessions: number;
  activeUsers: number;
}

const useUserActivity = () => {
  return useQuery({
    queryKey: ['userActivity'],
    queryFn: async (): Promise<ActivityData[]> => {
      console.log('📊 Buscando dados de atividade dos usuários...');

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('started_at, user_id')
        .gte('started_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('❌ Erro ao buscar sessões:', error);
        throw error;
      }

      // Agrupar por dia
      const dailyActivity: { [key: string]: { sessions: number; users: Set<string> } } = {};
      const last7Days = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        last7Days.push({ dateStr, dayName });
        dailyActivity[dateStr] = { sessions: 0, users: new Set() };
      }

      sessions?.forEach(session => {
        const dateStr = session.started_at.split('T')[0];
        if (dailyActivity[dateStr]) {
          dailyActivity[dateStr].sessions++;
          dailyActivity[dateStr].users.add(session.user_id);
        }
      });

      const result = last7Days.map(({ dateStr, dayName }) => ({
        day: dayName,
        sessions: dailyActivity[dateStr].sessions,
        activeUsers: dailyActivity[dateStr].users.size
      }));

      console.log('📊 Dados de atividade:', result);
      return result;
    },
    retry: 2,
    refetchInterval: 60000,
  });
};

export const UserActivityMetrics = () => {
  const { data: activityData, isLoading, error } = useUserActivity();

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Atividade dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-500">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Atividade dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-red-600">Erro ao carregar dados de atividade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = activityData?.reduce((sum, day) => sum + day.sessions, 0) || 0;
  const totalActiveUsers = activityData?.reduce((sum, day) => sum + day.activeUsers, 0) || 0;

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Atividade dos Usuários
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-slate-600">7 dias</div>
            <div className="text-lg font-bold text-green-600">
              {totalSessions} sessões
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'sessions' ? 'Sessões' : 'Usuários Ativos'
                ]}
              />
              <Bar 
                dataKey="sessions" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
