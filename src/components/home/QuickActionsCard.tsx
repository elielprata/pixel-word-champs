
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar } from 'lucide-react';

interface QuickActionsCardProps {
  onViewFullRanking: () => void;
}

const QuickActionsCard = ({ onViewFullRanking }: QuickActionsCardProps) => {
  return (
    <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFullRanking}
            className="flex flex-col items-center gap-2 h-auto py-3 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Ranking</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-2 h-auto py-3 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Amigos</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-2 h-auto py-3 border-green-200 text-green-600 hover:bg-green-50"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
