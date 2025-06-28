import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Zap } from 'lucide-react';
import { gameScoreService } from '@/services/gameScoreService';
interface XPProgressSectionProps {
  permanentXP: number; // experience_points
  temporaryScore: number; // total_score
  gamesPlayed: number;
}
const XPProgressSection = ({
  permanentXP,
  temporaryScore,
  gamesPlayed
}: XPProgressSectionProps) => {
  const levelInfo = gameScoreService.calculateLevelProgress(permanentXP);
  return <Card className="shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Progresso do Perfil
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Level and XP */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">{levelInfo.current}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Nível {levelInfo.current}</h3>
          <p className="text-sm text-gray-600">{permanentXP.toLocaleString()} XP Total</p>
        </div>
        
        {/* Progress to Next Level */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso para Nível {levelInfo.next}</span>
            <span className="font-medium">{Math.round(levelInfo.progress)}%</span>
          </div>
          <Progress value={levelInfo.progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{((levelInfo.current - 1) * 1000).toLocaleString()} XP</span>
            <span>{(levelInfo.current * 1000).toLocaleString()} XP</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{permanentXP.toLocaleString()}</div>
            <div className="text-sm text-blue-700">XP</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{temporaryScore.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Pontos Competição</div>
          </div>
        </div>

        {/* Games Played */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <span className="text-lg font-semibold text-gray-700">{gamesPlayed}</span>
          <span className="text-sm text-gray-600 ml-2">jogos completados</span>
        </div>
      </CardContent>
    </Card>;
};
export default XPProgressSection;