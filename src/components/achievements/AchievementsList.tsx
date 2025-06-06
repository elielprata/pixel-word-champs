
import React from 'react';
import AchievementCard from './AchievementCard';
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

interface AchievementsListProps {
  achievements: Achievement[];
  getRarityColor: (rarity: string) => string;
}

const AchievementsList = ({ achievements, getRarityColor }: AchievementsListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Todas as Conquistas</h3>
      
      {achievements.map((achievement) => (
        <AchievementCard 
          key={achievement.id}
          achievement={achievement}
          getRarityColor={getRarityColor}
        />
      ))}
    </div>
  );
};

export default AchievementsList;
