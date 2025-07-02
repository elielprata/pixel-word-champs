import React from 'react';
import { Settings, Coins, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
import { useUserStats } from '@/hooks/useUserStats';
const UserProfileHeader = () => {
  const {
    isAuthenticated
  } = useAuth();
  const {
    profile,
    isLoading: profileLoading
  } = useProfile();
  const {
    currentLevel
  } = usePlayerLevel(profile?.total_score || 0);
  const {
    stats,
    isLoading: statsLoading
  } = useUserStats();
  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return <div className="bg-gradient-to-r from-primary to-primary/80 p-4 rounded-xl text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-primary-foreground/20 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-primary-foreground/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-foreground/20 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-primary-foreground/20 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-foreground/20 rounded-full animate-pulse"></div>
              <div className="h-4 w-16 bg-primary-foreground/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="bg-gradient-to-r from-primary to-primary/80 p-4 rounded-xl text-primary-foreground">
      {/* Seção do perfil */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 border-2 border-primary-foreground/30">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'Usuário'} className="object-cover" />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-sm font-bold">
              {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">{profile?.username || 'Usuário'}</h2>
            <p className="text-primary-foreground/80 text-xs">Nível {currentLevel.level} - {currentLevel.title}</p>
          </div>
        </div>
      </div>
      
      {/* Seção integrada de pontos e posição */}
      <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {stats.totalScore.toLocaleString()} pontos
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <div className="text-sm font-bold">
                #{stats.position || '?'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default UserProfileHeader;