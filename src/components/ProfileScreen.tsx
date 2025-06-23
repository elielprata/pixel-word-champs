
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProfileHeader from './profile/ProfileHeader';
import ProfileStatsGrid from './profile/ProfileStatsGrid';
import ProfileMenu from './profile/ProfileMenu';
import { useProfile } from '@/hooks/useProfile';
import { logger } from '@/utils/logger';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { profile, isLoading } = useProfile();
  
  logger.debug('ProfileScreen renderizado', undefined, 'PROFILE_SCREEN');

  const handleMyData = () => {
    logger.info('Navegando para Meus Dados', undefined, 'PROFILE_SCREEN');
  };

  const handleAchievements = () => {
    logger.info('Navegando para Conquistas', undefined, 'PROFILE_SCREEN');
  };

  const handleHelp = () => {
    logger.info('Navegando para Ajuda', undefined, 'PROFILE_SCREEN');
  };

  const handleLogout = () => {
    logger.info('Fazendo logout', undefined, 'PROFILE_SCREEN');
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentLevel = Math.floor(profile.total_score / 1000) + 1;
  const nextLevel = currentLevel + 1;
  const progress = (profile.total_score % 1000) / 1000 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-purple-200 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-purple-800">Perfil</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <ProfileHeader 
          user={profile}
          currentLevel={currentLevel}
          nextLevel={nextLevel}
          progress={progress}
          gamesPlayed={profile.games_played}
          bestPosition={profile.best_weekly_position || 0}
        />
        <ProfileStatsGrid user={profile} />
        <ProfileMenu 
          onMyData={handleMyData}
          onAchievements={handleAchievements}
          onHelp={handleHelp}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default ProfileScreen;
