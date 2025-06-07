
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  theme: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  levels: number;
  is_active: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challengeId: number) => void;
}

export const ChallengeCard = ({ challenge, onEdit, onDelete }: ChallengeCardProps) => {
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Médio';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
          </div>
          <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
            {challenge.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div>Dificuldade: <span className="font-medium">{getDifficultyLabel(challenge.difficulty)}</span></div>
          <div>Níveis: <span className="font-medium">{challenge.levels}</span></div>
          <div>Tema: <span className="font-medium">{challenge.theme}</span></div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(challenge)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(challenge.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
