
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Edit } from 'lucide-react';
import { ChallengeModal } from './ChallengeModal';
import { useToast } from "@/components/ui/use-toast";

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
}

interface ChallengesTabProps {
  challenges: Challenge[];
}

export const ChallengesTab = ({ challenges: initialChallenges }: ChallengesTabProps) => {
  const [challenges, setChallenges] = useState(initialChallenges);
  const { toast } = useToast();

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
    toast({
      title: "Desafio excluído",
      description: `${challenge?.title} foi excluído com sucesso.`,
      variant: "destructive",
    });
  };

  const handleViewChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    toast({
      title: "Visualizando desafio",
      description: `Abrindo detalhes de ${challenge?.title}`,
    });
    console.log(`Visualizando desafio ${challengeId}`, challenge);
  };

  const handleEditChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    toast({
      title: "Editando desafio",
      description: `Abrindo editor para ${challenge?.title}`,
    });
    console.log(`Editando desafio ${challengeId}`, challenge);
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
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="flex flex-col items-center p-4 border rounded-lg space-y-3">
                {/* Nome do desafio acima */}
                <div className="w-full text-center">
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                </div>
                
                {/* Botões no meio */}
                <div className="flex items-center gap-2">
                  <Badge variant={
                    challenge.status === 'Ativo' ? 'default' :
                    challenge.status === 'Agendado' ? 'secondary' : 'outline'
                  }>
                    {challenge.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewChallenge(challenge.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditChallenge(challenge.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteChallenge(challenge.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Número de jogadores abaixo */}
                <div className="w-full text-center">
                  <span className="text-sm text-gray-600">{challenge.players} jogadores</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
