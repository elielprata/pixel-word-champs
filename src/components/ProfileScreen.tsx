import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Calendar, Trophy, Target, Star, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useProfile } from '@/hooks/auth/useProfile';
import AvatarUpload from './ui/AvatarUpload';
import { logger } from '@/utils/logger';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { user } = useAuth();
  const { profile, isLoading, error, updateProfile, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  logger.debug('ProfileScreen carregado', { 
    userId: user?.id,
    username: user?.username,
    email: user?.email,
    hasProfile: !!profile
  }, 'PROFILE_SCREEN');

  const handleBack = () => {
    logger.debug('Voltando da tela de perfil', undefined, 'PROFILE_SCREEN');
    onBack();
  };

  const handleEditClick = () => {
    logger.debug('Iniciando edição de perfil', undefined, 'PROFILE_SCREEN');
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    logger.info('Salvando perfil', { 
      newUsername: username,
      newAvatar: avatarUrl 
    }, 'PROFILE_SCREEN');

    const result = await updateProfile({ 
      username: username,
      avatar_url: avatarUrl
    });

    if (result.success) {
      logger.info('Perfil atualizado com sucesso', { 
        newUsername: username,
        newAvatar: avatarUrl 
      }, 'PROFILE_SCREEN');
      setIsEditing(false);
      refetch();
    } else {
      logger.error('Erro ao atualizar perfil', { error: result.error }, 'PROFILE_SCREEN');
      alert(`Erro ao salvar: ${result.error}`);
    }
  };

  const handleCancelClick = () => {
    logger.debug('Cancelando edição de perfil', undefined, 'PROFILE_SCREEN');
    setIsEditing(false);
    setUsername(profile?.username || '');
    setAvatarUrl(profile?.avatar_url || '');
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    logger.debug('Avatar atualizado', { newAvatarUrl }, 'PROFILE_SCREEN');
    setAvatarUrl(newAvatarUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
        <div className="animate-pulse">
          <Card>
            <CardHeader>
              <CardTitle>Carregando Perfil...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="h-24 bg-gray-200 rounded-full"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Erro ao carregar perfil: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-purple-800">
            {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
          </h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <AvatarUpload 
              currentAvatar={avatarUrl}
              fallback={profile?.username?.substring(0, 2).toUpperCase() || 'U'}
              onAvatarUpdate={handleAvatarUpdate}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome de Usuário
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full"
                />
              </div>
            ) : (
              <p className="mt-1 text-gray-900">{profile?.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-gray-900">{profile?.email}</p>
          </div>

          <div className="flex justify-between">
            {!isEditing ? (
              <Button variant="outline" onClick={handleEditClick}>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancelClick}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveClick}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pontuação Total
              </label>
              <p className="mt-1 text-gray-900">
                <Trophy className="inline-block w-4 h-4 mr-1" />
                {profile?.total_score}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Partidas Jogadas
              </label>
              <p className="mt-1 text-gray-900">
                <Target className="inline-block w-4 h-4 mr-1" />
                {profile?.games_played}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Melhor Pontuação Diária
              </label>
              <p className="mt-1 text-gray-900">
                <Star className="inline-block w-4 h-4 mr-1" />
                {profile?.best_daily_position || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ranking Semanal
              </label>
              <p className="mt-1 text-gray-900">
                <Star className="inline-block w-4 h-4 mr-1" />
                {profile?.best_weekly_position || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScreen;
