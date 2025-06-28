
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users } from 'lucide-react';

interface UserStatsCardsProps {
  userPoints: {
    invite_points: number;
  };
  userPosition: {
    position: number;
  } | null;
}

export const UserStatsCards = ({ userPoints, userPosition }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gift className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-2xl font-bold text-green-700">
              {userPoints.invite_points}
            </span>
          </div>
          <p className="text-sm text-green-600">Pontos Mensais</p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-1" />
            <span className="text-2xl font-bold text-blue-700">
              {userPosition?.position || '--'}
            </span>
          </div>
          <p className="text-sm text-blue-600">Posição Atual</p>
        </CardContent>
      </Card>
    </div>
  );
};
