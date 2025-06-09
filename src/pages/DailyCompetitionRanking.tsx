
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, Calendar, Medal, Crown } from 'lucide-react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface RankingParticipant {
  user_position: number;
  user_score: number;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

interface CompetitionInfo {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  theme?: string;
  max_participants: number;
}

const ITEMS_PER_PAGE = 25;

export default function DailyCompetitionRanking() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ranking, setRanking] = useState<RankingParticipant[]>([]);
  const [competition, setCompetition] = useState<CompetitionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (competitionId) {
      loadData();
    }
  }, [competitionId]);

  const loadData = async () => {
    if (!competitionId) return;

    setIsLoading(true);
    try {
      // Carregar informações da competição
      const competitionResponse = await customCompetitionService.getCompetitionById(competitionId);
      if (competitionResponse.success) {
        setCompetition(competitionResponse.data);
      }

      // Carregar ranking
      const rankingResponse = await dailyCompetitionService.getDailyCompetitionRanking(competitionId);
      if (rankingResponse.success) {
        setRanking(rankingResponse.data);
      } else {
        toast({
          title: "Erro ao carregar ranking",
          description: rankingResponse.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da competição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPositionBadgeColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-gray-100 text-gray-700 border-gray-200';
      case 3: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Paginação
  const totalPages = Math.ceil(ranking.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRanking = ranking.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando ranking...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Painel
          </Button>
        </div>

        {/* Competition Info */}
        {competition && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    {competition.title}
                  </CardTitle>
                  <p className="text-slate-600 mt-1">{competition.description}</p>
                </div>
                <div className="text-right">
                  <Badge className="mb-2">
                    {competition.status === 'active' ? 'Ativo' : 
                     competition.status === 'completed' ? 'Finalizado' : 'Agendado'}
                  </Badge>
                  {competition.theme && (
                    <Badge variant="outline" className="ml-2">
                      {competition.theme}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Início: {formatDate(competition.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Fim: {formatDate(competition.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>Participantes: {ranking.length}/{competition.max_participants}</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Ranking da Competição ({ranking.length} participantes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium mb-2">Nenhum participante ainda</p>
                <p className="text-sm">Os participantes aparecerão aqui conforme jogarem.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Posição</TableHead>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="text-right w-24">Pontuação</TableHead>
                      <TableHead className="text-right w-32">Participação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRanking.map((participant) => (
                      <TableRow key={participant.user_id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Badge className={getPositionBadgeColor(participant.user_position)}>
                              <div className="flex items-center gap-1">
                                {getPositionIcon(participant.user_position)}
                                {participant.user_position}º
                              </div>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <PlayerAvatar
                              src={participant.profiles?.avatar_url}
                              alt={participant.profiles?.username || 'Usuário'}
                              fallback={participant.profiles?.username?.charAt(0) || 'U'}
                              size="sm"
                            />
                            <span className="font-medium">
                              {participant.profiles?.username || 'Usuário'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {participant.user_score.toLocaleString()} pts
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          {new Date(participant.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {totalPages > 5 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
