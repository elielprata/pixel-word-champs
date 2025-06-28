
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  userPoints: {
    invite_points: number;
  };
  nextMilestone: number;
  milestoneProgress: number;
}

export const ProgressCard = ({ userPoints, nextMilestone, milestoneProgress }: ProgressCardProps) => {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-800">Próximo Marco</span>
          <span className="text-sm text-gray-600">
            {userPoints.invite_points}/{nextMilestone} pontos
          </span>
        </div>
        <Progress value={milestoneProgress} className="h-2 mb-2" />
        <p className="text-xs text-gray-500">
          Faltam {Math.max(0, nextMilestone - userPoints.invite_points)} pontos para o próximo marco
        </p>
      </CardContent>
    </Card>
  );
};
