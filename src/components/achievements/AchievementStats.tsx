
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AchievementStatsProps {
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
}

const AchievementStats = ({ unlockedCount, totalCount, totalPoints }: AchievementStatsProps) => {
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Progresso Geral</h2>
            <p className="text-sm opacity-90">
              {unlockedCount} de {totalCount} conquistas desbloqueadas
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-xs opacity-80">Pontos de Conquista</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementStats;
