
import React from 'react';
import { User } from '@/types';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Award } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  currentLevel: number;
  nextLevel: number;
  progress: number;
  bestPosition: number;
}

const ProfileHeader = ({ user, currentLevel, nextLevel, progress, bestPosition }: ProfileHeaderProps) => {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{user.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.username || 'Usuário'}</h2>
            <p className="text-white/80">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="text-sm text-white/80">Nível</span>
            </div>
            <p className="text-xl font-bold">{currentLevel}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 mr-1" />
              <span className="text-sm text-white/80">Pontos</span>
            </div>
            <p className="text-xl font-bold">{user.total_score}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 mr-1" />
              <span className="text-sm text-white/80">Jogos</span>
            </div>
            <p className="text-xl font-bold">{user.games_played}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Progresso para Nível {nextLevel}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="bg-white/20" />
        </div>

        {bestPosition && (
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm">Melhor Posição Semanal</p>
            <p className="text-xl font-bold">#{bestPosition}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
