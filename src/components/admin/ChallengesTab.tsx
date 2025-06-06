import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Edit, Target, TrendingUp, Users, Calendar } from 'lucide-react';
import { ChallengeModal } from './ChallengeModal';
import { ChallengeViewModal } from './ChallengeViewModal';
import { ChallengeEditModal } from './ChallengeEditModal';
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
}

interface ChallengesTabProps {
  challenges: Challenge[];
}

const CHALLENGES_PER_PAGE = 12;

export const ChallengesTab = ({ challenges: initialChallenges }: ChallengesTabProps) => {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(challenges.length / CHALLENGES_PER_PAGE);
  const startIndex = (currentPage - 1) * CHALLENGES_PER_PAGE;
  const endIndex = startIndex + CHALLENGES_PER_PAGE;
  const currentChallenges = challenges.slice(startIndex, endIndex);

  // Calculate statistics
  const totalChallenges = challenges.length;
  const activeChallenges = challenges.filter(c => c.status === 'Ativo').length;
  const scheduledChallenges = challenges.filter(c => c.status === 'Agendado').length;
  const totalPlayers = challenges.reduce((sum, c) => sum + c.players, 0);
  const avgPlayersPerChallenge = totalChallenges > 0 ? Math.round(totalPlayers / totalChallenges) : 0;

  const handleAddChallenge = (newChallengeData: Omit<Challenge, 'id'>) => {
    const newChallenge = {
      ...newChallengeData,
      id: Math.max(...challenges.map(c => c.id), 0) + 1
    };
    setChallenges(prev => [newChallenge, ...prev]);
    toast({
      title: "Desafio criado",
      description: `${newChallenge.title} foi criado com sucesso.`,
    });
  };

  const handleDeleteChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
    
    const newTotalPages = Math.ceil((challenges.length - 1) / CHALLENGES_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
    
    toast({
      title: "Desafio excluído",
      description: `${challenge?.title} foi excluído com sucesso.`,
      variant: "destructive",
    });
  };

  const handleViewChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setViewChallenge(challenge);
      toast({
        title: "Abrindo detalhes",
        description: `Visualizando ${challenge.title}`,
      });
    }
  };

  const handleEditChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setEditChallenge(challenge);
      toast({
        title: "Abrindo editor",
        description: `Editando ${challenge.title}`,
      });
    }
  };

  const handleSaveEditChallenge = (challengeId: number, updatedChallenge: Omit<Challenge, 'id'>) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...updatedChallenge, id: challengeId }
          : challenge
      )
    );
    toast({
      title: "Desafio atualizado",
      description: `${updatedChallenge.title} foi atualizado com sucesso.`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            isActive={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis2" />);
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              isActive={currentPage === totalPages}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Header com título e estatísticas principais */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestão de Desafios</h1>
              <p className="text-blue-100 text-sm">Configure e monitore todos os desafios da plataforma</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold">{totalChallenges}</div>
              <div className="text-xs text-blue-100">Total</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold">{activeChallenges}</div>
              <div className="text-xs text-blue-100">Ativos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Desafios Ativos</p>
                <p className="text-2xl font-bold text-green-700">{activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Agendados</p>
                <p className="text-2xl font-bold text-blue-700">{scheduledChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Jogadores</p>
                <p className="text-2xl font-bold text-purple-700">{totalPlayers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Média por Desafio</p>
                <p className="text-2xl font-bold text-amber-700">{avgPlayersPerChallenge}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Desafios */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-slate-800">Desafios Criados</CardTitle>
              <p className="text-sm text-slate-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, challenges.length)} de {challenges.length} desafios
              </p>
            </div>
            <ChallengeModal onAddChallenge={handleAddChallenge} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum desafio encontrado</h3>
              <p className="text-slate-500 mb-4">Comece criando seu primeiro desafio para engajar os usuários.</p>
              <ChallengeModal onAddChallenge={handleAddChallenge} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentChallenges.map(challenge => (
                  <div key={challenge.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-slate-300">
                    {/* Header do card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-base line-clamp-2 leading-tight" title={challenge.title}>
                          {challenge.title}
                        </h3>
                      </div>
                      <Badge 
                        variant={
                          challenge.status === 'Ativo' ? 'default' :
                          challenge.status === 'Agendado' ? 'secondary' : 'outline'
                        }
                        className={`ml-2 ${
                          challenge.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-200' :
                          challenge.status === 'Agendado' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
                        }`}
                      >
                        {challenge.status}
                      </Badge>
                    </div>
                    
                    {/* Estatísticas */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{challenge.players} jogadores</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Target className="h-4 w-4" />
                        <span>ID: #{challenge.id}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar visual */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          challenge.status === 'Ativo' ? 'bg-green-500' :
                          challenge.status === 'Agendado' ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(100, (challenge.players / 500) * 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewChallenge(challenge.id)}
                        className="flex-1 h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditChallenge(challenge.id)}
                        className="flex-1 h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              handlePageChange(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              handlePageChange(currentPage + 1);
                            }
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
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

      {/* Modais */}
      <ChallengeViewModal 
        challenge={viewChallenge}
        isOpen={!!viewChallenge}
        onClose={() => setViewChallenge(null)}
      />
      
      <ChallengeEditModal 
        challenge={editChallenge}
        isOpen={!!editChallenge}
        onClose={() => setEditChallenge(null)}
        onSave={handleSaveEditChallenge}
      />
    </div>
  );
};
