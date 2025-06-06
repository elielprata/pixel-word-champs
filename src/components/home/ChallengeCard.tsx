
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star, Users, Trophy, Target, Zap } from 'lucide-react';

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
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return { 
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
          text: 'Fácil',
          icon: Target
        };
      case 'medium': 
        return { 
          color: 'text-amber-600 bg-amber-50 border-amber-200', 
          text: 'Médio',
          icon: Zap
        };
      case 'hard': 
        return { 
          color: 'text-red-600 bg-red-50 border-red-200', 
          text: 'Difícil',
          icon: Trophy
        };
      default: 
        return { 
          color: 'text-gray-600 bg-gray-50 border-gray-200', 
          text: 'Normal',
          icon: Target
        };
    }
  };

  const difficultyConfig = getDifficultyConfig(challenge.difficulty);
  const DifficultyIcon = difficultyConfig.icon;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
              {challenge.completed && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  Concluído
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{challenge.levels} níveis</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{challenge.players.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${difficultyConfig.color}`}>
              <DifficultyIcon className="w-3 h-3" />
              {difficultyConfig.text}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => onViewChallengeRanking(challenge.id)}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => onStartChallenge(challenge.id)}
          disabled={challenge.completed}
          className={`w-full h-12 font-medium transition-all duration-200 ${
            challenge.completed 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {challenge.completed ? (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              Concluído
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Jogar Agora
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
