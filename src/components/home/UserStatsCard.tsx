
import React from 'react';
import { Trophy, Target, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRealUserStats } from '@/hooks/useRealUserStats';

const UserStatsCard = () => {
  const { data: stats, isLoading } = useRealUserStats();

  if (isLoading) {
    return (
      <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
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
      value: stats?.totalUsers || 0,
      label: 'Usuários',
      color: 'from-blue-400 to-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      icon: Target,
      value: stats?.totalSessions || 0,
      label: 'Sessões',
      color: 'from-green-400 to-green-600',
      iconColor: 'text-green-600'
    },
    {
      icon: Star,
      value: stats?.averageScore || 0,
      label: 'Média',
      color: 'from-purple-400 to-purple-600',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <Card className="mb-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mx-auto flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
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
