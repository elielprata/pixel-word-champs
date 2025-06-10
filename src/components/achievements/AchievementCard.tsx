
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress: number;
  total: number;
  rarity: string;
  points: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  getRarityColor: (rarity: string) => string;
}

const AchievementCard = ({ achievement, getRarityColor }: AchievementCardProps) => {
  const Icon = achievement.icon;
  const progressPercentage = (achievement.progress / achievement.total) * 100;
  
  return (
    <Card 
      className={`border transition-all duration-200 ${
        achievement.unlocked 
          ? 'bg-white shadow-md hover:shadow-lg' 
          : 'bg-gray-50 opacity-75'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            achievement.unlocked 
              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-bold ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${getRarityColor(achievement.rarity)}`}
              >
                {achievement.rarity}
              </Badge>
              {achievement.unlocked && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                  +{achievement.points} pts
                </Badge>
              )}
            </div>
            
            <p className={`text-sm mb-2 ${
              achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {achievement.description}
            </p>
            
            {!achievement.unlocked && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progresso</span>
                  <span>{achievement.progress} / {achievement.total}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
