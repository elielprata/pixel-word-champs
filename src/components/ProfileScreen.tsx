
import React, { useState, useEffect } from 'react';
import { User, Crown, Trophy, Target, Settings, HelpCircle, Star, Edit2, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
import { avatarService } from '@/services/avatarService';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface ProfileScreenProps {
  onNavigateToSettings: () => void;
  onNavigateToHelp: () => void;
  onNavigateToAchievements: () => void;
}

const ProfileScreen = ({ onNavigateToSettings, onNavigateToHelp, onNavigateToAchievements }: ProfileScreenProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      logger.debug('Carregando perfil do usuário', undefined, 'PROFILE_SCREEN');
      setIsLoading(true);
      
      try {
        const response = await profileService.getCurrentProfile();
        
        if (response.success && response.data) {
          setProfile(response.data);
          logger.debug('Perfil carregado com sucesso', { userId: response.data.id }, 'PROFILE_SCREEN');
        } else {
          logger.error('Erro ao carregar perfil', { error: response.error }, 'PROFILE_SCREEN');
        }
      } catch (error) {
        logger.error('Erro ao carregar perfil', { error }, 'PROFILE_SCREEN');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    logger.info('Iniciando upload de avatar', { fileName: file.name, fileSize: file.size }, 'PROFILE_SCREEN');
    setIsUploading(true);

    try {
      const response = await avatarService.uploadAvatar(file, user.id);
      
      if (response.success) {
        await profileService.updateProfile({ avatar_url: response.data });
        
        if (profile) {
          setProfile({ ...profile, avatar_url: response.data });
        }
        
        logger.info('Avatar atualizado com sucesso', undefined, 'PROFILE_SCREEN');
        toast({
          title: "Avatar atualizado!",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      } else {
        logger.error('Erro no upload de avatar', { error: response.error }, 'PROFILE_SCREEN');
        toast({
          title: "Erro no upload",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Erro ao fazer upload de avatar', { error }, 'PROFILE_SCREEN');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    if (!profile) return;
    
    logger.info('Atualizando dados do perfil', undefined, 'PROFILE_SCREEN');
    
    try {
      const response = await profileService.updateProfile(updatedData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        logger.info('Perfil atualizado com sucesso', undefined, 'PROFILE_SCREEN');
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        logger.error('Erro ao atualizar perfil', { error: response.error }, 'PROFILE_SCREEN');
        toast({
          title: "Erro",
          description: response.error || "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Erro ao atualizar perfil', { error }, 'PROFILE_SCREEN');
    }
  };

  if (isLoading || !profile) {
    return <div className="p-4">Carregando perfil...</div>;
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            <User className="mr-2 h-5 w-5 inline-block align-middle" />
            Meu Perfil
          </CardTitle>
          <Badge variant="secondary">
            Nível <Crown className="inline-block h-4 w-4 mr-1 align-middle" />
            {Math.floor(profile.total_score / 1000) + 1}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 relative">
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 cursor-pointer hover:bg-orange-600 transition">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-top-transparent"></div>
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </Avatar>
            <h2 className="text-xl font-semibold">{profile.username}</h2>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>{profile.total_score} Pontos</span>
              <Target className="h-5 w-5 text-blue-500 ml-4" />
              <span>{profile.games_played} Jogos</span>
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <Button className="w-full flex items-center justify-start" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
            <Button className="w-full flex items-center justify-start" variant="secondary" onClick={onNavigateToAchievements}>
              <Star className="mr-2 h-4 w-4" />
              Conquistas
            </Button>
            <Button className="w-full flex items-center justify-start" variant="secondary" onClick={onNavigateToSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button className="w-full flex items-center justify-start" variant="secondary" onClick={onNavigateToHelp}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda e Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScreen;
