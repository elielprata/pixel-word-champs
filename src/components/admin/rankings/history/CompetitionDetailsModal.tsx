
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, DollarSign, Crown, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface CompetitionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: {
    id: string;
    title: string;
    competition_type: string;
    start_date: string;
    end_date: string;
    status: string;
    prize_pool: number;
    max_participants: number;
    total_participants: number;
  } | null;
}

interface RankingParticipant {
  user_id: string;
  user_position: number;
  user_score: number;
  prize?: number;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

interface WeeklyRankingParticipant {
  user_id: string;
  username: string;
  position: number;
  total_score: number;
  prize_amount: number;
}

export const CompetitionDetailsModal: React.FC<CompetitionDetailsModalProps> = ({
  isOpen,
  onClose,
  competition
}) => {
  const [ranking, setRanking] = useState<RankingParticipant[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyRankingParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && competition) {
      if (competition.competition_type === 'tournament') {
        fetchWeeklyCompetitionRanking();
      } else {
        fetchCompetitionRanking();
      }
    }
  }, [isOpen, competition]);

  const getWeekDatesFromCompetition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Para competições semanais, calcular início da semana (segunda-feira)
    const weekStart = new Date(start);
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    console.log('🗓️ Buscando ranking semanal para período:', {
      competitionStart: startDate,
      competitionEnd: endDate,
      calculatedWeekStart: weekStartStr
    });
    
    return weekStartStr;
  };

  const fetchWeeklyCompetitionRanking = async () => {
    if (!competition) return;

    setIsLoading(true);
    try {
      console.log('🏆 Buscando ranking semanal para competição:', competition.id);

      const weekStart = getWeekDatesFromCompetition(competition.start_date, competition.end_date);

      // Buscar ranking semanal baseado no período da competição
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('user_id, username, position, total_score, prize_amount')
        .eq('week_start', weekStart)
        .order('position', { ascending: true });

      if (weeklyError) {
        console.error('❌ Erro ao buscar ranking semanal:', weeklyError);
        throw weeklyError;
      }

      if (!weeklyData || weeklyData.length === 0) {
        console.log('ℹ️ Nenhum ranking semanal encontrado para o período');
        setWeeklyRanking([]);
        return;
      }

      console.log('✅ Ranking semanal carregado:', weeklyData.length, 'participantes');
      setWeeklyRanking(weeklyData);

    } catch (error) {
      console.error('❌ Erro ao carregar ranking semanal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o ranking da competição semanal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetitionRanking = async () => {
    if (!competition) return;

    setIsLoading(true);
    try {
      console.log('🏆 Buscando ranking da competição regular:', competition.id);

      // Buscar participações da competição
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_position, user_score, prize')
        .eq('competition_id', competition.id)
        .order('user_position', { ascending: true });

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('ℹ️ Nenhuma participação encontrada');
        setRanking([]);
        return;
      }

      // Buscar perfis dos participantes
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Combinar dados
      const rankingData: RankingParticipant[] = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        
        return {
          user_id: participation.user_id,
          user_position: participation.user_position || 0,
          user_score: participation.user_score || 0,
          prize: participation.prize || 0,
          profiles: profile ? {
            username: profile.username || 'Usuário',
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('✅ Ranking carregado:', rankingData.length, 'participantes');
      setRanking(rankingData);

    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o ranking da competição",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': 
      case 'tournament': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'challenge': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Award className="h-4 w-4 text-orange-500" />;
    return <span className="text-sm font-medium">{position}º</span>;
  };

  if (!competition) return null;

  const isWeeklyCompetition = competition.competition_type === 'tournament';
  const displayRanking = isWeeklyCompetition ? weeklyRanking : ranking;
  const totalParticipants = isWeeklyCompetition ? weeklyRanking.length : ranking.length;
  const totalPrizes = isWeeklyCompetition 
    ? weeklyRanking.reduce((total, p) => total + (p.prize_amount || 0), 0)
    : ranking.reduce((total, p) => total + (p.prize || 0), 0);
  const winnersCount = isWeeklyCompetition
    ? weeklyRanking.filter(p => (p.prize_amount || 0) > 0).length
    : ranking.filter(p => (p.prize || 0) > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-600" />
            {competition.title}
            {isWeeklyCompetition && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 ml-2">
                Ranking Semanal Global
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Competição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações da Competição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Tipo</label>
                  <Badge className={getTypeColor(competition.competition_type)}>
                    {competition.competition_type === 'tournament' ? 'Competição Semanal' :
                     competition.competition_type === 'challenge' ? 'Desafio Diário' : 
                     competition.competition_type}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <Badge className={getStatusColor(competition.status)}>
                    {competition.status === 'completed' ? 'Finalizada' : 
                     competition.status === 'cancelled' ? 'Cancelada' : competition.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Período</label>
                  <div className="text-sm">
                    <div>{formatDate(competition.start_date)}</div>
                    <div className="text-slate-500">até</div>
                    <div>{formatDate(competition.end_date)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Prêmio Total</label>
                  <div className="text-lg font-bold text-green-600">
                    R$ {competition.prize_pool.toFixed(2)}
                  </div>
                </div>
              </div>

              {isWeeklyCompetition && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>💡 Competição Semanal:</strong> Este ranking mostra a pontuação total acumulada 
                    de todos os jogadores durante a semana da competição. É um ranking global onde todos 
                    os jogadores competem baseado em sua pontuação total.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{totalParticipants}</div>
                <div className="text-sm text-slate-600">Participantes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{winnersCount}</div>
                <div className="text-sm text-slate-600">Ganhadores</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">R$ {totalPrizes.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Prêmios Distribuídos</div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {isWeeklyCompetition ? 'Ranking Semanal Global' : 'Ranking Final'} ({totalParticipants} participantes)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full"></div>
                  <span className="ml-2">Carregando ranking...</span>
                </div>
              ) : displayRanking.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Posição</TableHead>
                        <TableHead className="font-semibold">Jogador</TableHead>
                        <TableHead className="font-semibold">Pontuação</TableHead>
                        <TableHead className="font-semibold">Prêmio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayRanking.map((participant) => {
                        const position = isWeeklyCompetition 
                          ? (participant as WeeklyRankingParticipant).position 
                          : (participant as RankingParticipant).user_position;
                        const score = isWeeklyCompetition 
                          ? (participant as WeeklyRankingParticipant).total_score 
                          : (participant as RankingParticipant).user_score;
                        const prize = isWeeklyCompetition 
                          ? (participant as WeeklyRankingParticipant).prize_amount 
                          : (participant as RankingParticipant).prize;
                        const username = isWeeklyCompetition 
                          ? (participant as WeeklyRankingParticipant).username 
                          : (participant as RankingParticipant).profiles?.username || 'Usuário';

                        return (
                          <TableRow key={participant.user_id} className="hover:bg-slate-50">
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                {getPositionIcon(position)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {username?.substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <span className="font-medium">{username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {score.toLocaleString()} pts
                            </TableCell>
                            <TableCell>
                              {(prize || 0) > 0 ? (
                                <span className="font-semibold text-green-600">
                                  R$ {(prize || 0).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Nenhum participante encontrado nesta competição</p>
                  {isWeeklyCompetition && (
                    <p className="text-sm mt-2">
                      O ranking semanal pode ainda não ter sido gerado para este período.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
