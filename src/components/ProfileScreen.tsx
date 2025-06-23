
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProfileHeader from './profile/ProfileHeader';
import ProfileStatsGrid from './profile/ProfileStatsGrid';
import ProfileMenu from './profile/ProfileMenu';
import { logger } from '@/utils/logger';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  logger.debug('ProfileScreen renderizado', undefined, 'PROFILE_SCREEN');

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
        <ProfileHeader />
        <ProfileStatsGrid />
        <ProfileMenu />
      </div>
    </div>
  );
};

export default ProfileScreen;
