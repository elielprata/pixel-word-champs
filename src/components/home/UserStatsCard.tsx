
import React from 'react';
import { Trophy, Target, Zap, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRealUserStats } from '@/hooks/useRealUserStats';

const UserStatsCard = () => {
  const { stats, isLoading } = useRealUserStats();

  if (isLoading) {
    return (
      <Card className="mb-6 bg-gradient-to-br from-slate-50 to-white border border-gray-200 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      icon: Trophy,
      value: stats?.totalScore || 0,
      label: 'Pontos',
      color: 'from-yellow-400 to-orange-500',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Target,
      value: stats?.gamesPlayed || 0,
      label: 'Jogos',
      color: 'from-blue-400 to-purple-500',
      iconColor: 'text-blue-600'
    },
    {
      icon: Star,
      value: stats?.bestScore || 0,
      label: 'Recorde',
      color: 'from-pink-400 to-purple-500',
      iconColor: 'text-pink-600'
    }
  ];

  return (
    <Card className="mb-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>
                <div className="font-bold text-lg text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
