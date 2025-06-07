
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Target } from 'lucide-react';

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
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-800 mb-2">
              {challenge.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {getDifficultyLabel(challenge.difficulty)}
              </Badge>
              <Badge variant={challenge.is_active ? "default" : "secondary"}>
                {challenge.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {challenge.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {challenge.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{challenge.levels} níveis</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>0 jogadores</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(challenge)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(challenge.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
