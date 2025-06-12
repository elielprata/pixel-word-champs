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

export const CompetitionDetailsModal: React.FC<CompetitionDetailsModalProps> = ({
  isOpen,
  onClose,
  competition
}) => {
  const [ranking, setRanking] = useState<RankingParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && competition) {
      fetchCompetitionRanking();
    }
  }, [isOpen, competition]);

  const fetchCompetitionRanking = async () => {
    if (!competition) return;

    setIsLoading(true);
    try {
      console.log('🏆 Buscando ranking da competição:', competition.id);

      // Buscar participações da competição
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_position, user_score, prize')
        .eq('competition_id', competition.id as any)
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

      // Filtrar e validar dados das participações
      const validParticipations = participations
        .filter((item: any) => item && typeof item === 'object' && !('error' in item) && item.user_id);

      // Buscar perfis dos participantes
      const userIds = validParticipations.map((p: any) => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Filtrar e validar perfis
      const validProfiles = (profiles || [])
        .filter((profile: any) => profile && typeof profile === 'object' && !('error' in profile));

      // Combinar dados
      const rankingData: RankingParticipant[] = validParticipations.map((participation: any) => {
        const profile = validProfiles.find((p: any) => p.id === participation.user_id);
        
        return {
          user_id: participation.user_id,
          user_position: participation.user_position || 0,
          user_score: participation.user_score || 0,
          prize: participation.prize || 0,
          profiles: profile && typeof profile === 'object' && !('error' in profile) ? {
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
      case 'weekly': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'tournament': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-600" />
            {competition.title}
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
                    {competition.competition_type === 'weekly' ? 'Semanal' :
                     competition.competition_type === 'tournament' ? 'Torneio' :
                     competition.competition_type === 'challenge' ? 'Desafio' : competition.competition_type}
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
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{ranking.length}</div>
                <div className="text-sm text-slate-600">Participantes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">
                  {ranking.filter(p => (p.prize || 0) > 0).length}
                </div>
                <div className="text-sm text-slate-600">Ganhadores</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  R$ {ranking.reduce((total, p) => total + (p.prize || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">Prêmios Distribuídos</div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking Final ({ranking.length} participantes)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full"></div>
                  <span className="ml-2">Carregando ranking...</span>
                </div>
              ) : ranking.length > 0 ? (
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
                      {ranking.map((participant) => (
                        <TableRow key={participant.user_id} className="hover:bg-slate-50">
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              {getPositionIcon(participant.user_position)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {participant.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
                              </div>
                              <span className="font-medium">
                                {participant.profiles?.username || 'Usuário'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {participant.user_score.toLocaleString()} pts
                          </TableCell>
                          <TableCell>
                            {(participant.prize || 0) > 0 ? (
                              <span className="font-semibold text-green-600">
                                R$ {(participant.prize || 0).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Nenhum participante encontrado nesta competição</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
