
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Calendar, Settings, HelpCircle, LogOut, Award, ChevronRight, Star, Zap, Target, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/ui/AvatarUpload';

interface ProfileScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAchievements?: () => void;
}

const ProfileScreen = ({ onNavigateToSettings, onNavigateToHelp, onNavigateToAchievements }: ProfileScreenProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url);

  const getPlayerLevel = () => {
    const score = user?.total_score || 0;
    if (score >= 10000) return { level: 10, title: "Lenda", icon: Crown, color: "from-yellow-400 to-orange-500" };
    if (score >= 5000) return { level: 9, title: "Mestre", icon: Trophy, color: "from-purple-500 to-pink-500" };
    if (score >= 2500) return { level: 8, title: "Expert", icon: Star, color: "from-blue-500 to-cyan-500" };
    if (score >= 1000) return { level: 7, title: "Avançado", icon: Target, color: "from-green-500 to-emerald-500" };
    if (score >= 500) return { level: 6, title: "Experiente", icon: Zap, color: "from-indigo-500 to-purple-500" };
    if (score >= 250) return { level: 5, title: "Veterano", icon: Award, color: "from-orange-500 to-red-500" };
    if (score >= 100) return { level: 4, title: "Competente", icon: Trophy, color: "from-teal-500 to-blue-500" };
    if (score >= 50) return { level: 3, title: "Intermediário", icon: Star, color: "from-purple-400 to-pink-400" };
    if (score >= 25) return { level: 2, title: "Iniciante", icon: Target, color: "from-green-400 to-blue-400" };
    return { level: 1, title: "Novato", icon: User, color: "from-gray-400 to-gray-500" };
  };

  const getNextLevelProgress = () => {
    const score = user?.total_score || 0;
    const thresholds = [0, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const currentLevel = getPlayerLevel().level;
    
    if (currentLevel >= 10) return { current: score, next: score, progress: 100 };
    
    const currentThreshold = thresholds[currentLevel - 1];
    const nextThreshold = thresholds[currentLevel];
    const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return { 
      current: score - currentThreshold, 
      next: nextThreshold - currentThreshold, 
      progress: Math.min(progress, 100) 
    };
  };

  const playerLevel = getPlayerLevel();
  const nextLevel = getNextLevelProgress();
  const LevelIcon = playerLevel.icon;

  const stats = [
    { 
      label: 'Jogos', 
      value: user?.games_played?.toString() || '0', 
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Melhor Posição', 
      value: user?.best_daily_position ? `#${user.best_daily_position}` : '-', 
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      label: 'Pontos', 
      value: user?.total_score?.toLocaleString() || '0', 
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  const handleSettings = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      console.log('Navegando para configurações...');
    }
  };

  const handleHelp = () => {
    if (onNavigateToHelp) {
      onNavigateToHelp();
    } else {
      console.log('Navegando para ajuda...');
    }
  };

  const handleAchievements = () => {
    if (onNavigateToAchievements) {
      onNavigateToAchievements();
    } else {
      console.log('Navegando para conquistas...');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      await logout();
      console.log('✅ Logout realizado com sucesso, redirecionando para auth');
      navigate('/auth');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { 
      label: 'Conquistas', 
      icon: Award, 
      action: handleAchievements,
      description: 'Veja seus troféus',
      color: 'text-yellow-600'
    },
    { 
      label: 'Configurações', 
      icon: Settings, 
      action: handleSettings,
      description: 'Personalize sua conta',
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
    setCurrentAvatar(newAvatarUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Seu Perfil</h1>
          <p className="text-sm text-gray-600">Estatísticas e progressão</p>
        </div>

        {/* Card principal do jogador */}
        <Card className={`mb-4 bg-gradient-to-r ${playerLevel.color} text-white border-0 shadow-lg`}>
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
                    Nível {playerLevel.level}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mb-2">{playerLevel.title}</p>
                
                {/* Barra de progresso para próximo nível */}
                {playerLevel.level < 10 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs opacity-90">
                      <span>{nextLevel.current} / {nextLevel.next} XP</span>
                      <span>Nível {playerLevel.level + 1}</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${nextLevel.progress}%` }}
                      />
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
                onClick={item.action}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                  item.danger ? 'hover:bg-red-50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.danger ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-600' : item.color}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
