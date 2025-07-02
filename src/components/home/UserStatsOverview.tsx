import React from 'react';
import { Coins, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';

const UserStatsOverview = () => {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalScore.toLocaleString()} pontos
              </div>
              <div className="text-sm text-gray-600">Pontuação total</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                #{stats.position || '?'}
              </div>
              <div className="text-sm text-gray-600">Posição</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsOverview;