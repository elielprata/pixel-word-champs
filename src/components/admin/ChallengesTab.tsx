
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
  avgScore: number;
}

interface ChallengesTabProps {
  challenges: Challenge[];
}

export const ChallengesTab = ({ challenges }: ChallengesTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Desafios</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Desafio
        </Button>
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
                    <span>Média: {challenge.avgScore} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    challenge.status === 'Ativo' ? 'default' :
                    challenge.status === 'Agendado' ? 'secondary' : 'outline'
                  }>
                    {challenge.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
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
