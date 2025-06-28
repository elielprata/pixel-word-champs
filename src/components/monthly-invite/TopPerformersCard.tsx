
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TopPerformersCardProps {
  topPerformers: Array<{
    username: string;
    invite_points: number;
  }>;
}

export const TopPerformersCard = ({ topPerformers }: TopPerformersCardProps) => {
  if (!topPerformers || topPerformers.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top 3 do Mês</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {topPerformers.slice(0, 3).map((performer: any, index: number) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                'bg-orange-50 border border-orange-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                'bg-orange-500'
              }`}>
                {index + 1}
              </div>
              <span className="font-medium text-gray-800 flex-1">
                {performer.username}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {performer.invite_points} pts
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
