
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Edit } from 'lucide-react';
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

const CHALLENGES_PER_PAGE = 10;

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
    
    // Ajustar página atual se necessário
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
      // Sempre mostrar primeira página
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

      // Páginas do meio
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

      // Sempre mostrar última página
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Desafios</h2>
        <ChallengeModal onAddChallenge={handleAddChallenge} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desafios Criados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentChallenges.map(challenge => (
              <div key={challenge.id} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                {/* Nome do desafio */}
                <div className="text-center">
                  <h3 className="font-semibold text-base truncate" title={challenge.title}>
                    {challenge.title}
                  </h3>
                </div>
                
                {/* Status e Jogadores */}
                <div className="text-center space-y-2">
                  <Badge variant={
                    challenge.status === 'Ativo' ? 'default' :
                    challenge.status === 'Agendado' ? 'secondary' : 'outline'
                  }>
                    {challenge.status}
                  </Badge>
                  <p className="text-sm text-gray-600">{challenge.players} jogadores</p>
                </div>
                
                {/* Botões de ação */}
                <div className="flex justify-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewChallenge(challenge.id)}
                    className="p-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditChallenge(challenge.id)}
                    className="p-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteChallenge(challenge.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6">
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
