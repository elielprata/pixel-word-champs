
import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Timer } from 'lucide-react';

interface CompetitionHeaderProps {
  currentMonth: string;
  daysRemaining: number;
}

export const CompetitionHeader = ({ currentMonth, daysRemaining }: CompetitionHeaderProps) => {
  return (
    <Card className="border-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Competição de Indicações</CardTitle>
              <p className="text-purple-100 text-sm">{currentMonth}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span className="text-sm">{daysRemaining} dias restantes</span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
