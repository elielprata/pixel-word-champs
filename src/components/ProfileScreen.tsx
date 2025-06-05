
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Trophy, Calendar, Settings, HelpCircle, LogOut, Award, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAchievements?: () => void;
}

const ProfileScreen = ({ onNavigateToSettings, onNavigateToHelp, onNavigateToAchievements }: ProfileScreenProps) => {
  const { user, logout } = useAuth();

  // Usar dados reais do usuário em vez de mock
  const stats = [
    { label: 'Desafios Jogados', value: user?.games_played?.toString() || '0', icon: Calendar },
    { label: 'Melhor Posição', value: user?.best_daily_position ? `#${user.best_daily_position}` : '-', icon: Trophy },
    { label: 'Pontos Total', value: user?.total_score?.toLocaleString() || '0', icon: User },
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
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { label: 'Configurações', icon: Settings, action: handleSettings },
    { label: 'Ajuda e Suporte', icon: HelpCircle, action: handleHelp },
    { label: 'Sair', icon: LogOut, action: handleLogout, danger: true },
  ];

  // Corrigir avatar fallback para lidar com username vazio
  const getAvatarFallback = () => {
    if (user?.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Perfil</h1>
        <p className="text-gray-600">Suas estatísticas e configurações</p>
      </div>

      {/* Perfil do Usuário */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-purple-600 text-xl font-bold">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold mb-1">{user?.username || 'Usuário'}</h2>
          <p className="text-sm opacity-80">{user?.email}</p>
          <div className="mt-4 flex justify-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.total_score || 0}</p>
              <p className="text-xs opacity-80">Pontos Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.games_played || 0}</p>
              <p className="text-xs opacity-80">Jogos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas Recentes */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Conquistas Recentes</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAchievements}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            Ver Todas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user?.best_daily_position && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Melhor Posição Diária</p>
                  <p className="text-sm text-gray-600">Posição #{user.best_daily_position}</p>
                </div>
              </div>
            )}
            {user?.games_played && user.games_played > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Jogos Completados</p>
                  <p className="text-sm text-gray-600">{user.games_played} jogos realizados</p>
                </div>
              </div>
            )}
            <button
              onClick={handleAchievements}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-colors"
            >
              <Award className="w-8 h-8 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Explorar Conquistas</p>
                <p className="text-sm text-gray-600">Descubra todos os troféus disponíveis</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Menu de Opções */}
      <Card>
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                item.danger ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScreen;
