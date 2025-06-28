
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from 'lucide-react';

interface ProgressToRewardCardProps {
  stats: {
    activeFriends: number;
  };
}

const ProgressToRewardCard = ({ stats }: ProgressToRewardCardProps) => {
  const nextRewardAt = 5;
  const progressToNextReward = (stats.activeFriends / nextRewardAt) * 100;

  return (
    <Card className="mb-6 border-0 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-800">Próxima Recompensa</span>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {stats.activeFriends}/{nextRewardAt} amigos
          </Badge>
        </div>
        <Progress value={progressToNextReward} className="h-2 mb-2" />
        <p className="text-sm text-gray-600">
          Convide mais {Math.max(0, nextRewardAt - stats.activeFriends)} amigos para ganhar <span className="font-semibold text-yellow-600">100 XP bônus!</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default ProgressToRewardCard;
