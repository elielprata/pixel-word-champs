
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Settings, HelpCircle, LogOut, Award, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
import { useWeeklyPositionManager } from '@/hooks/useWeeklyPositionManager';
import { logger } from '@/utils/logger';
import MyDataSection from './profile/MyDataSection';

interface ProfileScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAchievements?: () => void;
}

const ProfileScreen = ({ onNavigateToSettings, onNavigateToHelp, onNavigateToAchievements }: ProfileScreenProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url);
  const [showMyData, setShowMyData] = useState(false);

  // Usar o novo sistema de XP
  const { currentLevel, nextLevel, progress } = usePlayerLevel(user?.total_score || 0);
  const LevelIcon = currentLevel.icon;

  // Integrar gerenciamento automático das melhores posições
  const { forceUpdatePositions } = useWeeklyPositionManager();

  logger.debug('Renderizando ProfileScreen', { userId: user?.id }, 'PROFILE_SCREEN');

  const stats = [
    { 
      label: 'Jogos', 
      value: user?.games_played?.toString() || '0', 
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Melhor Posição Semanal', 
      value: user?.best_weekly_position ? `#${user.best_weekly_position}` : '-', 
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      label: 'XP Total', 
      value: user?.total_score?.toLocaleString() || '0', 
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  const handleMyData = () => {
    logger.info('Abrindo seção Meus Dados', undefined, 'PROFILE_SCREEN');
    setShowMyData(true);
  };

  const handleHelp = () => {
    logger.info('Navegando para ajuda', undefined, 'PROFILE_SCREEN');
    if (onNavigateToHelp) {
      onNavigateToHelp();
    }
  };

  const handleAchievements = () => {
    // Função desabilitada - não faz nada
    return;
  };

  const handleLogout = async () => {
    try {
      logger.info('Iniciando logout', { userId: user?.id }, 'PROFILE_SCREEN');
      await logout();
      logger.info('Logout realizado com sucesso', undefined, 'PROFILE_SCREEN');
      navigate('/auth');
    } catch (error) {
      logger.error('Erro ao fazer logout', { error }, 'PROFILE_SCREEN');
    }
  };

  const menuItems = [
    { 
      label: 'Meus Dados', 
      icon: User, 
      action: handleMyData,
      description: 'Editar perfil e informações PIX',
      color: 'text-blue-600'
    },
    { 
      label: 'Conquistas (em breve)', 
      icon: Award, 
      action: handleAchievements,
      description: 'Veja seus troféus',
      color: 'text-gray-400',
      disabled: true
    },
    { 
      label: 'Configurações', 
      icon: Settings, 
      action: onNavigateToSettings,
      description: 'Preferências do app',
      color: 'text-gray-600'
    },
    { 
      label: 'Ajuda', 
      icon: HelpCircle, 
      action: handleHelp,
      description: 'Suporte e dúvidas',
      color: 'text-blue-600'
    },
    { 
      label: 'Sair', 
      icon: LogOut, 
      action: handleLogout, 
      danger: true,
      description: 'Encerrar sessão',
      color: 'text-red-600'
    },
  ];

  const getAvatarFallback = () => {
    if (user?.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    logger.info('Avatar atualizado', undefined, 'PROFILE_SCREEN');
    setCurrentAvatar(newAvatarUrl);
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  if (showMyData) {
    return (
      <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setShowMyData(false)}>
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Meus Dados</h1>
            <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <MyDataSection />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Seu Perfil</h1>
        <p className="text-sm text-gray-600">Estatísticas e progressão</p>
      </div>

      {/* Card principal do jogador com novo sistema XP */}
      <Card className={`mb-4 bg-gradient-to-r ${currentLevel.color} text-white border-0 shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AvatarUpload
                currentAvatar={currentAvatar || undefined}
                fallback={getAvatarFallback()}
                onAvatarUpdate={handleAvatarUpdate}
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

      {/* Estatísticas compactas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Menu de ações */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.disabled ? undefined : item.action}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b last:border-b-0 ${
                item.disabled 
                  ? 'cursor-not-allowed bg-gray-50' 
                  : item.danger 
                    ? 'hover:bg-red-50' 
                    : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.disabled 
                  ? 'bg-gray-100' 
                  : item.danger 
                    ? 'bg-red-50' 
                    : 'bg-gray-50'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  item.disabled 
                    ? 'text-gray-400' 
                    : item.danger 
                      ? 'text-red-600' 
                      : item.color
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  item.disabled 
                    ? 'text-gray-400' 
                    : item.danger 
                      ? 'text-red-600' 
                      : 'text-gray-900'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs ${item.disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </div>
              {!item.disabled && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScreen;
