
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Edit } from 'lucide-react';
import { ChallengeModal } from './ChallengeModal';

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

  const handleAddChallenge = (newChallengeData: Omit<Challenge, 'id'>) => {
    const newChallenge = {
      ...newChallengeData,
      id: Math.max(...challenges.map(c => c.id), 0) + 1
    };
    setChallenges(prev => [newChallenge, ...prev]);
  };

  const handleDeleteChallenge = (challengeId: number) => {
    setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
  };

  const handleViewChallenge = (challengeId: number) => {
    console.log(`Visualizando desafio ${challengeId}`);
    // Implementar navegação para detalhes do desafio
  };

  const handleEditChallenge = (challengeId: number) => {
    console.log(`Editando desafio ${challengeId}`);
    // Implementar edição do desafio
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
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{challenge.players} jogadores</span>
                  </div>
                </div>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
