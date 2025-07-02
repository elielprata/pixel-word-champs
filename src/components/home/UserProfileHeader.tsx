import React from 'react';
import { Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';

const UserProfileHeader = () => {
  const { profile, isLoading } = useProfile();
  const { currentLevel } = usePlayerLevel(profile?.experience_points || 0);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-xl text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-white/30">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'Usuário'} />
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.username || 'Usuário'}</h2>
            <p className="text-purple-100 text-sm">Nível {currentLevel.level} - {currentLevel.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Settings className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfileHeader;