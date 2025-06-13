
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AchievementStats from './achievements/AchievementStats';
import AchievementsList from './achievements/AchievementsList';
import { createAchievements, getRarityColor } from './achievements/achievementData';
import { logger } from '@/utils/logger';

interface AchievementsScreenProps {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: AchievementsScreenProps) => {
  const { user } = useAuth();
  const achievements = createAchievements(user);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  logger.info('AchievementsScreen carregado', { 
    userId: user?.id,
    totalAchievements: achievements.length,
    unlockedAchievements: unlockedAchievements.length,
    totalPoints 
  }, 'ACHIEVEMENTS_SCREEN');

  const handleBack = () => {
    logger.debug('Voltando da tela de conquistas', undefined, 'ACHIEVEMENTS_SCREEN');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Conquistas</h1>
          <p className="text-gray-600">Seus troféus e marcos conquistados</p>
        </div>
      </div>

      {/* Stats */}
      <AchievementStats 
        unlockedCount={unlockedAchievements.length}
        totalCount={achievements.length}
        totalPoints={totalPoints}
      />

      {/* Achievements List */}
      <AchievementsList 
        achievements={achievements}
        getRarityColor={getRarityColor}
      />
    </div>
  );
};

export default AchievementsScreen;
