
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Trophy, CheckCircle } from 'lucide-react';
import { useChallengeParticipants } from '@/hooks/useChallengeParticipants';

interface Challenge {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  levels: number;
  players: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ChallengeCardProps {
  challenge: Challenge;
  onStartChallenge: (challengeId: number) => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const ChallengeCard = ({ challenge, onStartChallenge, onViewChallengeRanking }: ChallengeCardProps) => {
  const { participantCount, isLoading } = useChallengeParticipants(challenge.id);

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
    <Card className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
      challenge.completed ? 'bg-green-50' : 'bg-white'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
              {challenge.completed && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
            
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{challenge.levels} níveis</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{isLoading ? '...' : participantCount.toLocaleString()} jogadores</span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant="outline"
            className={`${getDifficultyColor(challenge.difficulty)} font-medium`}
          >
            {getDifficultyLabel(challenge.difficulty)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => onStartChallenge(challenge.id)}
            className={`flex-1 ${
              challenge.completed 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-medium`}
          >
            <Play className="w-4 h-4 mr-2" />
            {challenge.completed ? 'Jogar Novamente' : 'Iniciar Desafio'}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onViewChallengeRanking(challenge.id)}
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Trophy className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
