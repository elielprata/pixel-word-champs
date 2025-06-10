
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Trophy, Target, Calendar, Edit } from 'lucide-react';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const userStats = {
    gamesPlayed: 127,
    bestScore: 2547,
    averageScore: 1823,
    totalWords: 3429,
    level: 15,
    joinDate: 'Janeiro 2024'
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-blue-800">Meu Perfil</h1>
          <p className="text-sm text-blue-600">Seus dados e estatísticas</p>
        </div>
      </div>

      {/* Perfil principal */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">João Silva</h2>
              <p className="text-gray-600">@joaosilva</p>
              <p className="text-sm text-blue-600">Nível {userStats.level} • Membro desde {userStats.joinDate}</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.bestScore.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Melhor Pontuação</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Jogos Completos</div>
          </div>
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Estatísticas Detalhadas</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Pontuação Média</span>
            <span className="font-semibold text-blue-600">{userStats.averageScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total de Palavras</span>
            <span className="font-semibold text-green-600">{userStats.totalWords.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Taxa de Vitória</span>
            <span className="font-semibold text-purple-600">78%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Sequência Atual</span>
            <span className="font-semibold text-orange-600">5 vitórias</span>
          </div>
        </div>
      </div>

      {/* Conquistas */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Conquistas Recentes</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Primeiro Lugar Semanal</p>
              <p className="text-sm text-yellow-600">Conquistado há 2 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">100 Jogos Completos</p>
              <p className="text-sm text-blue-600">Conquistado há 1 semana</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Calendar className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">7 Dias Consecutivos</p>
              <p className="text-sm text-green-600">Conquistado há 2 semanas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
