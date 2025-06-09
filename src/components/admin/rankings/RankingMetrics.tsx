
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Crown, TrendingUp, Calendar, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const RankingMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeCompetitions: 0,
    totalPrizePool: 0,
    weeklyWinners: 0,
    completedCompetitions: 0,
    totalParticipations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando métricas reais do banco...');

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Competições ativas
      const { count: activeCompetitions } = await supabase
        .from('custom_competitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total de prêmios distribuídos
      const { data: prizeData } = await supabase
        .from('payment_history')
        .select('prize_amount')
        .eq('payment_status', 'paid');

      const totalPrizePool = prizeData?.reduce((sum, payment) => sum + Number(payment.prize_amount), 0) || 0;

      // Vencedores da semana atual
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { count: weeklyWinners } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('week_start', weekStartStr)
        .lte('position', 10);

      // Competições completadas
      const { count: completedCompetitions } = await supabase
        .from('custom_competitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Total de participações
      const { count: totalParticipations } = await supabase
        .from('competition_participations')
        .select('*', { count: 'exact', head: true });

      setMetrics({
        totalUsers: totalUsers || 0,
        activeCompetitions: activeCompetitions || 0,
        totalPrizePool,
        weeklyWinners: weeklyWinners || 0,
        completedCompetitions: completedCompetitions || 0,
        totalParticipations: totalParticipations || 0
      });

      console.log('✅ Métricas carregadas:', metrics);
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Usuários</p>
              <p className="text-2xl font-bold text-blue-700">{metrics.totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Ativas</p>
              <p className="text-2xl font-bold text-green-700">{metrics.activeCompetitions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Award className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Prêmios</p>
              <p className="text-xl font-bold text-yellow-700">R$ {metrics.totalPrizePool.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Crown className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Vencedores</p>
              <p className="text-2xl font-bold text-purple-700">{metrics.weeklyWinners}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Finalizadas</p>
              <p className="text-2xl font-bold text-orange-700">{metrics.completedCompetitions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-teal-600 font-medium">Participações</p>
              <p className="text-2xl font-bold text-teal-700">{metrics.totalParticipations}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
