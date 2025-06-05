import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Trophy, Calendar, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
}

const ProfileScreen = ({ onNavigateToSettings, onNavigateToHelp }: ProfileScreenProps) => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Desafios Jogados', value: '23', icon: Calendar },
    { label: 'Melhor Posição', value: '#12', icon: Trophy },
    { label: 'Pontos Total', value: '1,247', icon: User },
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
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-purple-600 text-xl font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold mb-1">{user?.username || 'Usuário'}</h2>
          <p className="text-sm opacity-80">{user?.email}</p>
          <div className="mt-4 flex justify-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.totalScore || 0}</p>
              <p className="text-xs opacity-80">Pontos Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.gamesPlayed || 0}</p>
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
        <CardHeader>
          <CardTitle className="text-lg">Conquistas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Top 20 Diário</p>
                <p className="text-sm text-gray-600">Alcançou posição #18 ontem</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Sequência de 7 dias</p>
                <p className="text-sm text-gray-600">Jogou por uma semana seguida</p>
              </div>
            </div>
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
