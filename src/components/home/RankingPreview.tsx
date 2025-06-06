
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

interface RankingPreviewProps {
  onViewFullRanking: () => void;
}

const RankingPreview = ({ onViewFullRanking }: RankingPreviewProps) => {
  const topPlayers = [
    { pos: 1, name: "João Silva", score: 2540 },
    { pos: 2, name: "Maria Santos", score: 2410 },
    { pos: 3, name: "Pedro Costa", score: 2380 },
  ];

  return (
    <Card className="mt-8 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">Top Players Hoje</CardTitle>
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topPlayers.map((player) => (
            <div key={player.pos} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-sm ${
                player.pos === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                player.pos === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
                {player.pos}
              </div>
              <span className="font-medium text-gray-900 flex-1">{player.name}</span>
              <div className="text-right">
                <div className="font-bold text-purple-600">{player.score}</div>
                <div className="text-xs text-gray-500">pts</div>
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 font-medium" 
          onClick={onViewFullRanking}
        >
          Ver Ranking Completo
        </Button>
      </CardContent>
    </Card>
  );
};

export default RankingPreview;
