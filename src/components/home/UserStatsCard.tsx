
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, TrendingUp } from 'lucide-react';

const UserStatsCard = () => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between text-white">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">#42</div>
            <div className="text-sm opacity-90">Posição</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">1.2k</div>
            <div className="text-sm opacity-90">Pontos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm opacity-90">Sequência</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
