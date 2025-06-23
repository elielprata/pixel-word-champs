
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { User } from '@/types';

interface ProfileHeaderProps {
  user: User | null;
  currentAvatar?: string;
  currentLevel: any;
  nextLevel: any;
  progress: any;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  getAvatarFallback: () => string;
  formatXP: (xp: number) => string;
}

const ProfileHeader = ({ 
  user, 
  currentAvatar, 
  currentLevel, 
  nextLevel, 
  progress, 
  onAvatarUpdate, 
  getAvatarFallback, 
  formatXP 
}: ProfileHeaderProps) => {
  const LevelIcon = currentLevel.icon;

  return (
    <Card className={`mb-4 bg-gradient-to-r ${currentLevel.color} text-white border-0 shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AvatarUpload
              currentAvatar={currentAvatar || undefined}
              fallback={getAvatarFallback()}
              onAvatarUpdate={onAvatarUpdate}
              size="lg"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <LevelIcon className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">{user?.username || 'Jogador'}</h2>
              <Badge className="bg-white/20 text-white text-xs">
                Nível {currentLevel.level}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mb-2">{currentLevel.title}</p>
            
            {/* Barra de progresso para próximo nível */}
            {nextLevel && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs opacity-90">
                  <span>{formatXP(progress.current)} / {formatXP(progress.next)} XP</span>
                  <span>{nextLevel.title}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Jogador máximo - Lenda da Linguagem */}
            {!nextLevel && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-bold">NÍVEL MÁXIMO ATINGIDO!</span>
                  <Star className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full h-2 animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
